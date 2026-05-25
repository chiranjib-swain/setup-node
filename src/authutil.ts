import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as core from '@actions/core';
import * as github from '@actions/github';

export function configAuthentication(registryUrl: string) {
  const npmrc: string = path.resolve(
    process.env['RUNNER_TEMP'] || process.cwd(),
    '.npmrc'
  );
  if (!registryUrl.endsWith('/')) {
    registryUrl += '/';
  }

  writeRegistryToFile(registryUrl, npmrc);
}

function writeRegistryToFile(registryUrl: string, fileLocation: string) {
  let scope: string = core.getInput('scope');
  if (!scope && registryUrl.indexOf('npm.pkg.github.com') > -1) {
    scope = github.context.repo.owner;
  }
  if (scope && scope[0] != '@') {
    scope = '@' + scope;
  }
  if (scope) {
    scope = scope.toLowerCase() + ':';
  }

  core.debug(`Setting auth in ${fileLocation}`);
  let newContents = '';
  if (fs.existsSync(fileLocation)) {
    const curContents: string = fs.readFileSync(fileLocation, 'utf8');
    curContents.split(os.EOL).forEach((line: string) => {
      // Add current contents unless they are setting the registry
      if (!line.toLowerCase().startsWith(`${scope}registry`)) {
        newContents += line + os.EOL;
      }
    });
  }
  // Remove http: or https: from front of registry.
  const registryString = `${scope}registry=${registryUrl}`;

  // Detect scenario
  const isOIDC = !!process.env['ACTIONS_ID_TOKEN_REQUEST_TOKEN'];
  const hasNodeAuthToken =
    !!process.env.NODE_AUTH_TOKEN && process.env.NODE_AUTH_TOKEN.trim() !== '';

  if (isOIDC) {
    // OIDC: do not write _authToken, do not export token.
    core.info(
      'OIDC detected: not injecting _authToken, not exporting NODE_AUTH_TOKEN.'
    );
    newContents += `${registryString}`;
    // Do NOT export NODE_AUTH_TOKEN
  } else if (hasNodeAuthToken) {
    // Classic token: inject auth line and export for subsequent steps
    const authString =
      registryUrl.replace(/(^\w+:|^)/, '') + ':_authToken=${NODE_AUTH_TOKEN}';
    newContents += `${authString}${os.EOL}${registryString}`;
    core.exportVariable('NODE_AUTH_TOKEN', process.env.NODE_AUTH_TOKEN!);
  } else {
    // No token, no OIDC: just write registry, don't export anything, don't break .npmrc
    core.info(
      'No NODE_AUTH_TOKEN provided and OIDC not detected: only writing registry URL.'
    );
    newContents += `${registryString}`;
    // Do NOT export NODE_AUTH_TOKEN
  }

  fs.writeFileSync(fileLocation, newContents);
  core.exportVariable('NPM_CONFIG_USERCONFIG', fileLocation);
}
