(function(global) {
    "use strict";

    var str = "Am I 3D?";
    var fontSize = 18;
    var fontName ="'ヒラギノ角ゴ Pro W3', 'Hiragino Kaku Gothic Pro', 'メイリオ', Meiryo, Osaka, 'ＭＳ Ｐゴシック', 'MS PGothic'";

    var width = 1400;
    var height = 700;

    var cubes = [];
    var table;

    var scene,renderer,camera,controls,wall;

    initRender();

    // regenerate
    $("#generate").click(function(){
        $("canvas").remove();

        var inputStr = $("#str").val();
        if (inputStr !== "") {
            str = inputStr;
        }

//        var inputFontSize = $("#fontSize").val();
//        if (inputFontSize !== "") {
//            fontSize = inputFontSize;
//        }

        initRender();
        showWall();
    });

    // regenerate
    $("#wall").change(function(){
        showWall();
    });

    function showWall() {
        if ($("#wall").prop("checked") === true) {
            scene.add(wall);
        } else {
            scene.remove(wall);
        }
    }

    function initRender() {
        // scene
        scene = new THREE.Scene()

        // wall
        createWall();

        // rendering
        renderer = new THREE.WebGLRenderer();
        renderer.setSize(width, height);
        renderer.setClearColor("#000000", 1);
        renderer.shadowMapEnabled = true;
        document.getElementById('stage').appendChild(renderer.domElement);

        // camera
        camera = new THREE.PerspectiveCamera(100, width / height, 10, 10000);
        camera.position.set(50,-50,500);

        // light
        setLight(scene);

        // control
        controls = new THREE.OrbitControls(camera, renderer.domElement);

        // render
        generateLogo(str,fontSize)
    }

    function generateLogo() {
        createCubes(scene,cubes);
        render();
    }

    function createCubes(scene,cubes){
        var table = getAsciiBlocks(str,fontSize);

        table.reverse();
        table.forEach(function(row,rowIndex) {
            row.forEach(function(cell,colIndex) {
                if (cell === 1) {
                    var cube = createCube(colIndex,rowIndex,table,row)
                    cubes.push(cube);
                    scene.add(cube);
                }
            })
        })
    }

    function createWall() {
        // plane
        var geometry = new THREE.PlaneGeometry(3000,800);
        var material = new THREE.MeshLambertMaterial({color: "#bbbbbb", side: THREE.DoubleSide});
        wall = new THREE.Mesh(geometry, material);
        wall.position.set(0,0,-100);
        wall.receiveShadow = true;
    }

    function setLight(scene){
        // light
        var light = new THREE.DirectionalLight("#ffffff", 1);
        light.position.set(1500,0,1000);
        light.castShadow = true;
        scene.add(light);
        var ambient = new THREE.AmbientLight("#222222", 1);
        scene.add(ambient);
    }


    function createCube(colIndex,rowIndex,table,row) {
        var cubeSize = 12;
        var geometry = new THREE.BoxGeometry(cubeSize,cubeSize,cubeSize);
        var material = new THREE.MeshLambertMaterial({color: "#ffffff"});
        var cube;
        cube = new THREE.Mesh(geometry, material);
        cube.castShadow = true;
        cube.position.set(calcPosition(row,colIndex),calcPosition(table,rowIndex),0)

        return cube;
    }

    function calcPosition(array,index) {
        return index * 15 - (array.length / 2 * 15);
    }

    function render() {
        requestAnimationFrame(render);

        cubes.forEach(function(c){
            c.rotation.x += 0.01;
            c.rotation.y += 0.01;
            c.rotation.z += 0.01;

        });
        renderer.render(scene, camera);
        controls.update();
    }

    function getAsciiBlocks(str,fontSize,fontName) {
        // init
        var i, j;
        var canvasTmp = $("<canvas>")[0];
        if(!canvasTmp.getContext) return;
        var contextTmp = canvasTmp.getContext('2d');
        var fontStyle = fontSize + "px " + fontName;
        var strWidth, strHeight;
        var table = [];

        // measure text
        contextTmp.font  = fontStyle;
        canvasTmp.width  = strWidth  = Math.ceil(contextTmp.measureText(str).width);
        canvasTmp.height = strHeight = Math.ceil(fontSize * 1.5);

        // render text
        contextTmp.font = fontStyle;
        contextTmp.textBaseline = "top";
        contextTmp.fillText(str, 0, 0);

        // get image data
        var imgdata = contextTmp.getImageData(0, 0, strWidth, strHeight);
        var exist = false;
        var cnt = 0;
        for(i = 0; i < strHeight; i++){
            for(j = 0; j < strWidth; j++){
                var alpha = imgdata.data[(strWidth * i + j) * 4 + 3];
                if(alpha >= 128){
                    if(!exist) exist = true;
                    if(!table[i + cnt]) table[i + cnt] = [];
                    table[i + cnt][j] = 1;
                }
            }
            if(table[i + cnt]){
                for(j = 0; j < strWidth; j++){
                    if(!table[i + cnt][j]) table[i + cnt][j] = 0;
                }
            }
            if(!exist) cnt--;
        }

        return table;
    }

})((this || 0).self || global);
