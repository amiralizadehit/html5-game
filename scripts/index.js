$(function() {
  const canvas = document.getElementById("tetris");
  var context = canvas.getContext("2d");
  var cw = canvas.width;
  var ch = canvas.height;

  context.fillStyle = "#000";
  context.fillRect(0, 0, canvas.width, canvas.height);

  $.getJSON("../assets/asset.json", function(json) {
    let image = new Image();
    image.onload = function() {
      let gameObjects = []; //to keep track of all the possible gameobjects
      let currentObject = {}; //to keep track of the fired gameobject

      let shapes = json.frames;

      for (let shape in shapes) {
        const { w, h, x, y } = shapes[shape].frame;
        let gameobject = {
          matrix: GetObjectMatrix(shape),
          frame: {
            width: w,
            height: h,
            xPos: x,
            yPos: y
          },
          offset: {
            x: 0,
            y: 0
          },
          id: "" //Generated when firing
        };
        gameObjects.push(gameobject);
      }

      function Draw(gameObject) {
        context.fillStyle = "#000";
        context.fillRect(0, 0, canvas.width, canvas.height);

        const { width, height, xPos, yPos } = gameObject.frame;
        const { x, y } = gameObject.offset;
        context.drawImage(
          image,
          xPos,
          yPos,
          width,
          height,
          x,
          y,
          width,
          height
        );
      }

      const playField = CreateMatrix(12, 21);

      function CreateMatrix(w, h) {
        const matrix = [];
        while (h--) {
          let blockObj = {
            value: 0, //all blocks are empty at the beginning
            id: "" //this is going to be replaced by the id of the gameobject this block is part of
          };
          matrix.push(new Array(w).fill(blockObj));
        }
        return matrix;
      }
      function Merge(playField) {
        let shapeMatrix = currentObject.matrix;
        shapeMatrix.forEach((row, y) => {
          row.forEach((value, x) => {
            if (value !== 0) {
              playField[y + currentObject.offset.y / 30][
                x + currentObject.offset.x / 30
              ].value = value;
              playField[y + currentObject.offset.y / 30][
                x + currentObject.offset.x / 30
              ].id = currentObject.id;
            }
          });
        });
      }
      function Collide(shapeMatrix) {
        for (let y = 0; y < shapeMatrix.length; y++) {
          for (let x = 0; x < shapeMatrix[y].length; x++) {
            if (
              shapeMatrix[y][x] !== 0 &&
              (playField[y + currentObject.offset.y / 30] &&
                playField[y + currentObject.offset.y / 30][
                  x + currentObject.offset.x / 30
                ]) !== 0
            ) {
              return true;
            }
          }
        }
        return false;
      }

      window["Merge"] = Merge; //temp
      window["gameObjects"] = gameObjects; //temp
      window["playField"] = playField; //temp

      function PlayerDrop() {
        currentObject.offset.y += 30;
        dropCounter = 0;
      }

      let dropCounter = 0;
      let dropInterval = 1000;
      let lasttime = 0;
      function update(time = 0) {
        const deltaTime = time - lasttime;
        lasttime = time;
        dropCounter += deltaTime;
        if (dropCounter > dropInterval) {
          PlayerDrop();
        }

        Draw(gameObjects[0]);
        requestAnimationFrame(update);
      }
      currentObject = gameObjects[0];
      currentObject.id = Math.random()
        .toString(36)
        .substring(7);
      console.log(currentObject);

      window["currentObj"] = currentObject; //temp

      update();
      function GetObjectMatrix(shape) {
        switch (shape) {
          case "animal_deer.png":
            return [[1, 1], [1, 0]];

          case "animal_chicken.png":
            return [[2]];

          case "animal_crocodile.png":
            return [[0, 0], [3, 3]];

          case "animal_elephant.png":
            return [[4, 4], [4, 4]];

          case "animal_fox.png":
            return [[5, 0], [5, 5]];

          case "animal_girafe.png":
            return [[0, 6, 0], [0, 6, 0], [0, 6, 0]];

          case "animal_panda.png":
            return [[7, 0], [7, 0]];

          case "bloc.png":
            return [[8]];
        }
      }
      document.addEventListener("keydown", event => {
        if (event.keyCode === 37) {
          currentObject.offset.x -= 30;
        } else if (event.keyCode === 39) {
          currentObject.offset.x += 30;
        } else if (event.keyCode === 40) {
          PlayerDrop();
        }
      });
    };
    image.src = "./assets/asset.png";
  });
});
