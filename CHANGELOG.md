# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.5.0](https://github.com/rjbma/ts-state-machine/compare/v0.4.3...v0.5.0) (2023-07-14)


### ⚠ BREAKING CHANGES

* remove `NoOpTriggers`. Instead, a trigger can now have a `void` target state, in which case, the state machine remains in the same state

### Features

* remove `NoOpTriggers`. Instead, a trigger can now have a `void` target state, in which case, the state machine remains in the same state ([c3eb1e7](https://github.com/rjbma/ts-state-machine/commit/c3eb1e770ae12263ee048fca20d18beb5346cf9a))
* when using `useMachine` (on a React app), make sure the initial trigger is run only once ([d236466](https://github.com/rjbma/ts-state-machine/commit/d2364669fa71ccb65bb4708fa206a5d558adec46))

### 0.4.3 (2023-07-14)


### Features

* ability to define sync transitions ([75f8d2d](https://github.com/rjbma/ts-state-machine/commit/75f8d2d145ecddf4709e882cb254d742bda7f536))
* add state change handler to the machine ([0764b29](https://github.com/rjbma/ts-state-machine/commit/0764b2993d3c364fd77bf24f4416d249fc868d3f))
* add state change handler to the machine ([e3f8f3a](https://github.com/rjbma/ts-state-machine/commit/e3f8f3abd6185234b7cea2e60b94c0197927a862))
* all transitions are now async ([9537869](https://github.com/rjbma/ts-state-machine/commit/9537869c2bfcfba0f5c9ac0bd33fa7dc6974e99a))
* cancellable triggers ([889a883](https://github.com/rjbma/ts-state-machine/commit/889a883fcdfea284bc78d095f3057dc46c765d50))
* deffered transitions ([c13ece0](https://github.com/rjbma/ts-state-machine/commit/c13ece0727866b9a46c8bfc03808eb4c70beeedd))
* define transitions separately ([cc06e46](https://github.com/rjbma/ts-state-machine/commit/cc06e46147615b3571532cb194b1d9648cc704d9))
* first version (sync only) ([751da69](https://github.com/rjbma/ts-state-machine/commit/751da693a5a8b61cd83d7301001de2d4d49e8fd0))
* no need for the `data` field ([6a44622](https://github.com/rjbma/ts-state-machine/commit/6a446228ec990a0d9cef5845c9d4a3adbda35b50))
* no-op triggers ([2dc2d3e](https://github.com/rjbma/ts-state-machine/commit/2dc2d3e45953281b8057210aea1843584dc77586))
* refactor machine creation ([1f05fdc](https://github.com/rjbma/ts-state-machine/commit/1f05fdc2e2d60088b9bba41466d05535027d07f0))
* refactor machine creation ([ab18b22](https://github.com/rjbma/ts-state-machine/commit/ab18b229b2c1c32ee0c8ed0df563bd4cfdf01c25))
* renamed `state` to `status` ([dfb8e26](https://github.com/rjbma/ts-state-machine/commit/dfb8e26ca48fd86f9306d23ea5c9037bc2f8f2dc))
* triggers ([859d238](https://github.com/rjbma/ts-state-machine/commit/859d238c85710005e4b0995246ddad380bed1186))
* triggers ([2f59a3f](https://github.com/rjbma/ts-state-machine/commit/2f59a3f9513845449d1319a7eb2607c9f9314113))
* useMachine is now initialized with an initial transition ([80ca8f8](https://github.com/rjbma/ts-state-machine/commit/80ca8f8b485132da86d96b197a0882f760dcee93))
* useMachine to use with React ([4520ec9](https://github.com/rjbma/ts-state-machine/commit/4520ec9247330aa0e08b30911671511c916f90df))


### Bug Fixes

* fixed compilation issues ([88a43b2](https://github.com/rjbma/ts-state-machine/commit/88a43b2bd4ec217e9823e9b41aa8fd24d98647fd))
* fixed react-example ([00c8ee5](https://github.com/rjbma/ts-state-machine/commit/00c8ee5f6fb12c63e25a9233dd810927089eba9f))
* trigger for the first state wasn't being correctly canceled ([fc44d04](https://github.com/rjbma/ts-state-machine/commit/fc44d042beb9cd5fc41ba4f8593daffab401f76b))
