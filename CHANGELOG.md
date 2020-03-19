# Changelog

## [Unreleased]

## [0.3] - 2020-03-19
### Added
- Added bounce "eroding" mechanism
- Added game info readout panel

### Changed
- Improved code style

## [0.2] - 2019-12-19
### Added
- Scalable graphics

### Changed
- Removed dependence between game state and graphics
    - Graphic are handled by drawing on a Canvas
    - All entities (Balls, cells, board) are separated into objects

## [0.1] - 2018-09-26
### Added
- Minimum playable functionality:
    - Player ball control with arrow keys or WASD
    - Enemies
    - Zone claiming
    - Win and lose conditions
