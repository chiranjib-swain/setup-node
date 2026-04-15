## Working with lockfiles

All supported package managers recommend that you **always** commit the lockfile, although implementations vary doing so generally provides the following benefits:

- Enables faster installation for CI and production environments, due to being able to skip package resolution.
- Describes a single representation of a dependency tree such that teammates, deployments, and continuous integration are guaranteed to install exactly the same dependencies.
- Provides a facility for users to "time-travel" to previous states of `node_modules` without having to commit the directory itself.
- Facilitates greater visibility of tree changes through readable source control diffs.

In order to get the most out of using your lockfile on continuous integration follow the conventions outlined below for your respective package manager.

### NPM

Ensure that `package-lock.json` is always committed, use `npm ci` instead of `npm install` when installing packages.

**See also:**
- [Documentation of `package-lock.json`](https://docs.npmjs.com/cli/v8/configuring-npm/package-lock-json)
- [Documentation of `npm ci`](https://docs.npmjs.com/cli/v8/commands/npm-ci)

### Yarn

To ensure that `yarn.lock` is always committed, use `yarn install --immutable` when installing packages.

**See also:**
- [Documentation of `yarn.lock`](https://classic.yarnpkg.com/en/docs/yarn-lock)
- [Documentation of `--frozen-lockfile` option](https://classic.yarnpkg.com/en/docs/cli/install#toc-yarn-install-frozen-lockfile)
- [QA - Should lockfiles be committed to the repository?](https://yarnpkg.com/getting-started/qa/#should-lockfiles-be-committed-to-the-repository)
- [Documentation of `yarn install`](https://yarnpkg.com/cli/install)

### PNPM

Ensure that `pnpm-lock.yaml` is always committed, when on CI pass `--frozen-lockfile` to `pnpm install` when installing packages.

**See also:**
- [Working with Git - Lockfiles](https://pnpm.io/git#lockfiles)
- [Documentation of `--frozen-lockfile` option](https://pnpm.io/cli/install#--frozen-lockfile)

## Check latest version

The `check-latest` flag defaults to `false`. When set to `false`, the action will first check the local cache for a semver match. If unable to find a specific version in the cache, the action will attempt to download a version of Node.js. It will pull LTS versions from [node-versions releases](https://github.com/actions/node-versions/releases) and on miss or failure will fall back to the previous behavior of downloading directly from [node dist](https://nodejs.org/dist/). Use the default or set `check-latest` to `false` if you prefer stability and if you want to ensure a specific version of Node.js is always used.

If `check-latest` is set to `true`, the action first checks if the cached version is the latest one. If the locally cached version is not the most up-to-date, a version of Node.js will then be downloaded. Set `check-latest` to `true` it you want the most up-to-date version of Node.js to always be used.

> Setting `check-latest` to `true` has performance implications as downloading versions of Node is slower than using cached versions.

```yaml
steps:
- uses: actions/checkout@v5
- uses: actions/setup-node@v6
  with:
    node-version: '24'
    check-latest: true
- run: npm ci
- run: npm test
```

## Node version file

The `node-version-file` input accepts a path to a file containing the version of Node.js to be used by a project, for example `.nvmrc`, `.node-version`, `.tool-versions`, or `package.json`. If both the `node-version` and the `node-version-file` inputs are provided then the `node-version` input is used.
See [supported version syntax](https://github.com/actions/setup-node#supported-version-syntax).

> The action will search for the node version file relative to the repository root.

```yaml
steps:
- uses: actions/checkout@v5
- uses: actions/setup-node@v6
  with:
    node-version-file: '.nvmrc'
- run: npm ci
- run: npm test
```

When using the `package.json` input, the action will look for `volta.node` first. If `volta.node` isn't defined, then it will look for `engines.node`.

```json
{
  "engines": {
    "node": ">=16.0.0"
  },
  "volta": {
    "node": "16.0.0"
  }
}
```

Otherwise, when [`volta.extends`](https://docs.volta.sh/advanced/workspaces) is defined, then it will resolve the corresponding file and look for `volta.node` or `engines.node` recursively.

## Architecture

You can use any of the [supported operating systems](https://docs.github.com/en/actions/using-github-hosted-runners/about-github-hosted-runners), and the compatible `architecture` can be selected using `architecture`. Values are `x86`, `x64`, `arm64`, `armv6l`, `armv7l`, `ppc64le`, `s390x` (not all of the architectures are available on all platforms).

When using `architecture`, `node-version` must be provided as well.
```yaml
jobs:
  build:
    runs-on: windows-latest
    name: Node sample
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v6
        with:
          node-version: '24'
          architecture: 'x64' # optional, x64 or x86. If not specified, x64 will be used by default
      - run: npm ci
      - run: npm test
```

## V8 Canary versions

You can specify a nightly version to download it from https://nodejs.org/download/v8-canary.

### Install v8 canary build for specific node version

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    name: Node sample
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v6
        with:
          node-version: '24.0.0-v8-canary' # it will install the latest v8 canary release for node 24.0.0
      - run: npm ci
      - run: npm test
```
### Install v8 canary build for major node version

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    name: Node sample
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v6
        with:
          node-version: '24-v8-canary' # it will install the latest v8 canary release for node 24
      - run: npm ci
      - run: npm test
```

### Install the exact v8 canary version

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    name: Node sample
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v6
        with:
          node-version: 'v24.0.0-v8-canary2025030537242e55ac'
      - run: npm ci
      - run: npm test
```

## Nightly versions

You can specify a nightly version to download it from https://nodejs.org/download/nightly. 

### Install the nightly build for a major version

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    name: Node sample
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v6
        with:
          node-version: '24-nightly' # it will install the latest nightly release for node 24
      - run: npm ci
      - run: npm test
```

### Install the nightly build for a specific version

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    name: Node sample
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v6
        with:
          node-version: '24.0.0-nightly' # it will install the latest nightly release for node 24.0.0
      - run: npm ci
      - run: npm test
```

### Install an exact nightly version

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    name: Node sample
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v6
        with:
          node-version: '24.0.0-nightly202505066102159fa1'
      - run: npm ci
      - run: npm test
```

## RC versions

You can use specify a rc version to download it from https://nodejs.org/download/rc.

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    name: Node sample
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v6
        with:
          node-version: '24.0.0-rc.4'
      - run: npm ci
      - run: npm test
```

**Note:** Unlike nightly versions, which support version range specifiers, you must specify the exact version for a release candidate: `24.0.0-rc.4`.

## Caching packages data
The action follows [actions/cache](https://github.com/actions/cache/blob/main/examples.md#node---npm) guidelines, and caches global cache on the machine instead of `node_modules`, so cache can be reused between different Node.js versions.

**Caching yarn dependencies:**
Yarn caching handles both Yarn Classic (v1) and Yarn Berry (v2, v3, v4+).

```yaml
steps:
- uses: actions/checkout@v5
- uses: actions/setup-node@v6
  with:
    node-version: '24'
    cache: 'yarn'
- run: yarn install --frozen-lockfile # optional, --immutable
- run: yarn test
```

**Caching pnpm (v6.10+) dependencies:**
```yaml
# This workflow uses actions that are not certified by GitHub.
# They are provided by a third-party and are governed by
# separate terms of service, privacy policy, and support
# documentation.

# NOTE: pnpm caching support requires pnpm version >= 6.10.0

steps:
- uses: actions/checkout@v5
- uses: pnpm/action-setup@v4
  with:
    version: 10
- uses: actions/setup-node@v6
  with:
    node-version: '24'
    cache: 'pnpm'
- run: pnpm install
- run: pnpm test
```

> **Note**: By default `--frozen-lockfile` option is passed starting from pnpm `6.10.x`. It will be automatically added if you run it on [CI](https://pnpm.io/cli/install#--frozen-lockfile). 
> If the `pnpm-lock.yaml` file changes then pass `--frozen-lockfile` option.


**Using wildcard patterns to cache dependencies**
```yaml
steps:
- uses: actions/checkout@v5
- uses: actions/setup-node@v6
  with:
    node-version: '24'
    cache: 'npm'
    cache-dependency-path: '**/package-lock.json'
- run: npm ci
- run: npm test
```

**Using a list of file paths to cache dependencies**
```yaml
steps:
- uses: actions/checkout@v5
- uses: actions/setup-node@v6
  with:
    node-version: '24'
    cache: 'npm'
    cache-dependency-path: |
      server/app/package-lock.json
      frontend/app/package-lock.json
- run: npm ci
- run: npm test
```

**Restore-Only Cache**

```yaml
## In some workflows, you may want to restore a cache without saving it. This can help reduce cache writes and storage usage in workflows that only need to read from cache
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      # Restore Node.js modules cache (restore-only)
      - name: Restore Node modules cache
        uses: actions/cache@v4
        id: cache-node-modules
        with:
          path: ~/.npm
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-node-
      # Setup Node.js
      - name: Setup Node.js
        uses: actions/setup-node@v6
        with:
          node-version: '24'
      # Install dependencies
      - run: npm install
```

> For more details related to cache scenarios, please refer [Node – npm](https://github.com/actions/cache/blob/main/examples.md#node---npm).

## Multiple Operating Systems and Architectures

```yaml
jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os:
          - ubuntu-latest
          - macos-latest
          - windows-latest
        node_version:
          - 20
          - 22
          - 24
        architecture:
          - x64
        # an extra windows-x86 run:
        include:
          - os: windows-latest
            node_version: 24
            architecture: x86
    name: Node ${{ matrix.node_version }} - ${{ matrix.architecture }} on ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v5
      - name: Setup node
        uses: actions/setup-node@v6
        with:
          node-version: ${{ matrix.node_version }}
          architecture: ${{ matrix.architecture }}
      - run: npm ci
      - run: npm test
```

## Publish to npmjs and GPR with npm
```yaml
steps:
- uses: actions/checkout@v5
- uses: actions/setup-node@v6
  with:
    node-version: '24.x'
    registry-url: 'https://registry.npmjs.org'
- run: npm ci
- run: npm publish
  env:
    NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
- uses: actions/setup-node@v6
  with:
    registry-url: 'https://npm.pkg.github.com'
- run: npm publish
  env:
    NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Publish to npmjs and GPR with yarn
```yaml
steps:
- uses: actions/checkout@v5
- uses: actions/setup-node@v6
  with:
    node-version: '24.x'
    registry-url: <registry url>
- run: yarn install --frozen-lockfile
- run: yarn publish
  env:
    NODE_AUTH_TOKEN: ${{ secrets.YARN_TOKEN }}
- uses: actions/setup-node@v6
  with:
    registry-url: 'https://npm.pkg.github.com'
- run: yarn publish
  env:
    NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Use private packages
```yaml
steps:
- uses: actions/checkout@v5
- uses: actions/setup-node@v6
  with:
    node-version: '24.x'
    registry-url: 'https://registry.npmjs.org'
# Skip post-install scripts here, as a malicious
# script could steal NODE_AUTH_TOKEN.
- run: npm ci --ignore-scripts
  env:
    NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
# `npm rebuild` will run all those post-install scripts for us.
- run: npm rebuild && npm run prepare --if-present
```
### Yarn2 configuration
Yarn2 ignores both .npmrc and .yarnrc files created by the action, so before installing dependencies from the private repo it is necessary either to create or to modify existing yarnrc.yml file with `yarn config set` commands.

Below you can find a sample "Setup .yarnrc.yml" step, that is going to allow you to configure a private GitHub registry for 'my-org' organisation.

```yaml
steps:
- uses: actions/checkout@v5
- uses: actions/setup-node@v6
  with:
    node-version: '24.x'
- name: Setup .yarnrc.yml
  run: |
    yarn config set npmScopes.my-org.npmRegistryServer "https://npm.pkg.github.com"
    yarn config set npmScopes.my-org.npmAlwaysAuth true
    yarn config set npmScopes.my-org.npmAuthToken $NPM_AUTH_TOKEN
  env:
    NPM_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
- name: Install dependencies
  run: yarn install --immutable
```

To access private GitHub Packages within the same organization, go to "Manage Actions access" in Package settings and set the repositories you want to access.

Please refer to the [Ensuring workflow access to your package - Configuring a package's access control and visibility](https://docs.github.com/en/packages/learn-github-packages/configuring-a-packages-access-control-and-visibility#ensuring-workflow-access-to-your-package) for more details.

## Publishing to npm with Trusted Publisher (OIDC)

npm supports [Trusted Publishers](https://docs.npmjs.com/trusted-publishers), which allow publishing packages from GitHub Actions using OpenID Connect (OIDC) instead of long-lived tokens.

Trusted publishing improves security by eliminating long-lived npm tokens and using short-lived OIDC credentials. This approach reduces the risk of credential leakage and simplifies authentication in CI/CD workflows


### Requirements

Trusted publishing requires a compatible npm version:

* **npm ≥ 11.5.1 (required)**
* **Node.js 24 or newer (recommended)** — includes a compatible npm version by default

> ⚠️ If npm is below 11.5.1, publishing will fail even if OIDC permissions are correctly configured.


### Example workflow

```yaml
name: Publish to npm

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v6
        with:
          node-version: 24
          registry-url: 'https://registry.npmjs.org/'

      - run: npm ci
      - run: npm run build --if-present
      - run: npm publish --access public
```

### Important

* `id-token: write` is required for OIDC authentication
* `contents: read` is required for repository access
* If a Trusted Publisher is configured with a GitHub Actions environment, it must also be set on the job (e.g. `environment: release`).

OIDC authentication is handled automatically via GitHub’s identity token.

> ⚠️ If the Trusted Publisher configuration (GitHub owner/repo/workflow file, and optional environment) does not match the workflow run, publishing may fail with **E404 Not Found** even if the package exists in the registry.

### How authentication works

When running in a supported CI environment, npm:

* Detects the OIDC environment
* Attempts OIDC-based authentication
* Falls back to token-based authentication if OIDC is not available

### Authentication note

`NODE_AUTH_TOKEN` is **not required** for Trusted Publisher (OIDC).

* If present, it may interfere with OIDC by causing npm to attempt token-based authentication instead.
* Recommended: **Do not set `NODE_AUTH_TOKEN`** (and consider unsetting `NODE_AUTH_TOKEN`, `NPM_TOKEN`, and `NPM_AUTH_TOKEN`) when using OIDC to avoid unexpected conflicts.


### Compatibility note

* OIDC publishing depends on npm support (≥ 11.5.1).
* Using older Node.js versions (with older npm) can result in authentication failures.
* Clearing or unsetting `NODE_AUTH_TOKEN` **does not resolve failures caused by incompatible npm versions**.
* If you need to use an older Node.js version, upgrade npm before publishing (example):

  ```yaml
  - uses: actions/setup-node@v6
    with:
      node-version: 20
      registry-url: 'https://registry.npmjs.org/'

  # Ensure npm 11.5.1 or later is installed
  - run: npm install -g npm@latest 
  - run: npm publish --access public
  ```
### Limitations

* Trusted publishing is supported only on GitHub-hosted runners.
* Self-hosted runners are not currently supported but are planned for future releases.

### FAQ

**Q: Do I need to set `NODE_AUTH_TOKEN` for Trusted Publisher (OIDC)?**

No. OIDC replaces the need for tokens entirely.

**Q: My package exists on npm, but `npm publish` fails with `E404 Not Found`. Why?**

This usually indicates that the Trusted Publisher configuration does not exactly match the workflow run (repository, workflow filename, or environment), or that the workflow does not have permission to publish to the package or scope.

All fields are case-sensitive and must match exactly.



### Troubleshooting

* Verify npm version:
```yaml
npm -v
```

Ensure it is ≥ 11.5.1
* Ensure `id-token: write` permission is set
* Check that the workflow filename matches exactly (including `.yml`)
* Ensure the repository and organization match `npm` configuration
* Ensure `repository.url` in `package.json` matches your GitHub repository

### References

* https://docs.npmjs.com/trusted-publishers 
* https://docs.github.com/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect 

## Use private mirror

It is possible to use a private mirror hosting Node.js binaries. This mirror must be a full mirror of the official Node.js distribution.
The mirror URL can be set using the `mirror` input.
It is possible to specify a token to authenticate with the mirror using the `mirror-token` input.
The token will be passed as a bearer token in the `Authorization` header.

```yaml
- uses: actions/setup-node@v6
  with:
    node-version: '24.x'
    mirror: 'https://nodejs.org/dist'
    mirror-token: 'your-mirror-token'
```
