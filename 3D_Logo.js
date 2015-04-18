(function(global) {
    "use strict";

    var str = "ぶっちゃー";
    var fontSize = 18;
    var fontName ="arial";

    var width = 1200;
    var height = 700;

    var cubes = [];
    var table;

    var scene,renderer,camera,controls;

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
    });

    function generateLogo() {
        createCubes(scene,cubes);
        setLight(scene);
        getAsciiBlocks(str,fontSize,fontName)
        render();
    }

    function initRender() {
        // scene
        scene = new THREE.Scene()

        // rendering
        renderer = new THREE.WebGLRenderer();
        renderer.setSize(width, height);
        renderer.setClearColor("#000000", 1);
        renderer.shadowMapEnabled = true;
        document.getElementById('stage').appendChild(renderer.domElement);

        // camera
        camera = new THREE.PerspectiveCamera(100, width / height, 10, 10000);
        camera.position.set(50,-50,500);

        // control
        controls = new THREE.OrbitControls(camera, renderer.domElement);

        // render
        generateLogo(str,fontSize)
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

    function setLight(scene){
        // light
        var light = new THREE.DirectionalLight("#ffffff", 1);
        light.position.set(0,100,30);
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
            c.rotation.x += 0.01; // 追加
            c.rotation.y += 0.01; // 追加
            c.rotation.z += 0.01; // 追加

        });
        renderer.render(scene, camera);
        controls.update();
    }

    function getAsciiBlocks(str,fontSize,fontName) {
        // init
        var i, j;
        var canvas_tmp = $("<canvas>")[0];
        if(!canvas_tmp.getContext) return;
        var context_tmp = canvas_tmp.getContext('2d');
        var fontStyle = fontSize + "px " + fontName;
        var str_width, str_height;
        var table = [];

        // measure text
        context_tmp.font = fontStyle;
        canvas_tmp.width = str_width = context_tmp.measureText(str).width;
        canvas_tmp.height = str_height = Math.ceil(fontSize * 1.5);

        // render text
        context_tmp.font = fontStyle;
        context_tmp.textBaseline = "top";
        context_tmp.fillText(str, 0, 0);

        // get image data
        var imgdata = context_tmp.getImageData(0, 0, str_width, str_height);
        var exist = false;
        var cnt = 0;
        for(i = 0; i < str_height; i++){
            for(j = 0; j < str_width; j++){
                var alpha = imgdata.data[(str_width * i + j) * 4 + 3];
                if(alpha >= 128){
                    if(!exist) exist = true;
                    if(!table[i + cnt]) table[i + cnt] = [];
                    table[i + cnt][j] = 1;
                }
            }
            if(table[i + cnt]){
                for(j = 0; j < str_width; j++){
                    if(!table[i + cnt][j]) table[i + cnt][j] = 0;
                }
            }
            if(!exist) cnt--;
        }

        return table;
    }

})((this || 0).self || global);
