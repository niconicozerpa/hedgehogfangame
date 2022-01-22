import Tile from "./tile";

const solidTile = Tile.createFullySolidTile();

export const BigTiles = {
    basicFloor: [
        ...new Array(12).fill(null),
        [
            solidTile,
            Tile.createTile([14, 14, 14, 14, 14, 14, 14, 14, 13, 13, 13, 13, 13, 13, 13, 13]),
            Tile.createTile([12, 12, 12, 12, 12, 12, 12, 12, 11, 11, 11, 11, 11, 11, 11, 11]),
            Tile.createTile([12, 12, 12, 12, 11, 11, 11, 11, 10, 10, 10, 10, 9, 9, 9, 9]),
            Tile.createTile([9, 9, 9, 9, 9, 9, 9, 9, 10, 10, 10, 10, 10, 10, 10, 10]),
            Tile.createTile([11, 11, 11, 11, 11, 11, 11, 11, 12, 12, 12, 12, 12, 12, 12, 12]),
            Tile.createTile([13, 13, 13, 13, 13, 13, 13, 13, 14, 14, 14, 14, 14, 14, 14, 14]),
            Tile.createTile([13, 13, 13, 13, 13, 13, 13, 13, 14, 14, 14, 14, 14, 14, 14, 14]),
            solidTile,
            solidTile,
            solidTile,
            solidTile,
            solidTile,
            solidTile,
            solidTile,
            solidTile
        ],
        ...new Array(3).fill(new Array(16).fill(solidTile))
    ]
};
