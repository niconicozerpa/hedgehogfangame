const Tile = {
    createTile(heightArray, flippedX = false, flippedY = false, angle = 0) {
        return {
            angle,
            heightArray,
            flippedX,
            flippedY
        };
    },
    
    createTileSolidArray(solid16Array = []) {
        return solid16Array
                .slice(0, 16)
                .concat(
                    new Array(16 - Math.min(16, solid16Array.length)).fill(0)
                );
    },

    createFullySolidTile() {
        return Tile.createTile(
            Tile.createTileSolidArray(new Array(16).fill(16))
        );
    },

    createNonSolidTile() {
        return Tile.createTile(
            Tile.createTileSolidArray(),
            0
        );
    },

    checkCollision(x, y, tile) {
        if (tile.flippedX) {
            x = 15 - x;
        }
        if (tile.flippedY) {
            y = 15 - y;
        }
        return y < tile.heightArray[x];
    }
    
}
export default Tile;