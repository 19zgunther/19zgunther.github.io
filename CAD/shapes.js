/***********************************************************************************************
*  Code Written by Zack Gunther
*  If you would like to copy or use this code email me at 19zgunther@gmail.com to ask permission!
************************************************************************************************/

function generateGrid(numLines = 50)
{
    let vertices = [];
    let indices = [];
    let normals = [];
    let colors = [];
    let lineIndices = [];
    let lineColors = [];

    let minorLineColor = new vec4(0.5, 0.5, 0.5, 1);
    let majorLineColor = new vec4(0, 0, 0, 1);

    let indOn = 0;
    for (var i=-numLines; i<=numLines; i++)
    {
        vertices.push(i, 0, -numLines,   i, 0, numLines);
        vertices.push( -numLines, 0, i,   numLines, 0, i);
        lineIndices.push( indOn, indOn + 1, indOn + 2, indOn + 3);
        if (i%10 == 0)
        {
            lineColors.push(majorLineColor.x, majorLineColor.y, majorLineColor.z, majorLineColor.a,
                majorLineColor.x, majorLineColor.y, majorLineColor.z, majorLineColor.a,
                majorLineColor.x, majorLineColor.y, majorLineColor.z, majorLineColor.a,
                majorLineColor.x, majorLineColor.y, majorLineColor.z, majorLineColor.a, );
        } else {
            lineColors.push(minorLineColor.x, minorLineColor.y, minorLineColor.z, minorLineColor.a,
                minorLineColor.x, minorLineColor.y, minorLineColor.z, minorLineColor.a,
                minorLineColor.x, minorLineColor.y, minorLineColor.z, minorLineColor.a,
                minorLineColor.x, minorLineColor.y, minorLineColor.z, minorLineColor.a, );
        }
        indOn += 4;
    }

    return {
        type: 'cube',
        vertices: vertices,
        indices: indices, 
        normals: normals,
        colors: colors,
        lineIndices: lineIndices,
        lineColors: lineColors,
    };
}

function generateCylinder(radius = 0.5, height = 1, divisions = 40) {
    //let vertices = [0,height/2,0, 0,-height/2,0, ];
    let vertices = [];
    let indices = [];
    //let normals = [0,1,0,  0,-1,0];
    //let colors = [0.5, 0.5, 0.5, 1,   0.5, 0.5, 0.5, 1];
    let normals = [];
    let colors = [];
    let lineIndices = [];

    let i = 0;
    let si = 0;
    //Add Sides
    for (var a=0; a<2*Math.PI; a += 2*Math.PI/divisions)
    {   
        vertices.push( Math.cos(a)*radius, height/2, Math.sin(a)*radius ); //adding top vertice
        vertices.push( Math.cos(a)*radius, -height/2, Math.sin(a)*radius ); //adding bottom vertice

        colors.push( 0.5, 0.5, 0.5, 1,  0.5, 0.5, 0.5, 1, );
        normals.push( Math.cos(a), 0, Math.sin(a),    Math.cos(a), 0, Math.sin(a),  );
        i += 2;
        if (a > 0)
        {
            //                 side triangle 1   side triangle 2  top triangle  bottom triangle
            indices.push( i-1, i-3, i-2,   i-3, i-4, i-2,);//  0, i-2, i-4,  1,i-3,i-1);
            lineIndices.push(i-1, i-3, i-2, i-4);
        }
    }
    indices.push( i-1, i-2, si,   si,si+1, i-1,  );//i-2,0,si,   1, i-1, si+1);
    lineIndices.push(i-1, si+1, i-2, si);

    
    
    //top
    vertices.push(0, height/2, 0);
    si = Math.round(vertices.length/3);
    i = si;
    for (var a=0; a<2*Math.PI; a += 2*Math.PI/divisions)
    {   
        vertices.push( Math.cos(a)*radius, height/2, Math.sin(a)*radius ); //adding top vertice
        colors.push( 0.5, 0.5, 0.5, 1,  0.5, 0.5, 0.5, 1, );
        normals.push( 0,1,0, );
        i += 1;
        if (a > 0)
        {
            indices.push( si, i, i-1);
        }
    }

    //bottom
    vertices.push(0, -height/2, 0);
    si = Math.round(vertices.length/3);
    i = si;
    for (var a=0; a<2*Math.PI; a += 2*Math.PI/divisions)
    {   
        vertices.push( Math.cos(a)*radius, -height/2, Math.sin(a)*radius ); //adding top vertice
        colors.push( 0.5, 0.5, 0.5, 1,  0.5, 0.5, 0.5, 1, );
        normals.push( 0,1,0, );
        i += 1;
        if (a > 0)
        {
            indices.push( si, i-1, i);
        }
    }

    //indices.push( i-1, i-2, si,   si,si+1, i-1,  i-2,0,si,   1, i-1, si+1);
    //lineIndices.push(i-1, si+1, i-2, si);

    return {
        type: 'cylinder',
        vertices: vertices,
        indices: indices,
        normals: normals,
        colors: colors,
        lineIndices: lineIndices,
    };
}

function generateCube()
{
    return {
        type: 'cube',
        vertices: cubeVertices,
        indices: cubeIndices, 
        normals: cubeNormals,
        colors: cubeColors,
        lineIndices: cubeLineIndices,
    };
}


function generateArrow(length = 1, radius = 0.2, numDivisions = 40,  color = new vec4(1, 0.4, 0.4, 1), shaftRadius = 0.07, shaftRatio = 0.6, enableLines = false, zStartOffset=0)
{
    let col = color;

    let vertices = [];
    let indices = [];
    let normals = [];
    let colors = [];
    let lineIndices = [];

    let indOn = 0;

    //Front slant part of arrow
    for (var i=0; i<numDivisions; i++)
    {
        let a1 = i * 2 * Math.PI/numDivisions;
        let aAvg = (i+0.5) * 2 * Math.PI/numDivisions;
        let a2 = (i+1) * 2 * Math.PI/numDivisions;

        //Slant part of arrow
        vertices.push( Math.sin(a1)*radius, Math.cos(a1)*radius, shaftRatio*length );
        vertices.push( Math.sin(a2)*radius, Math.cos(a2)*radius, shaftRatio*length );
        vertices.push( 0, 0, length );
        //Back of slant arrow part
        vertices.push( Math.sin(a1)*radius, Math.cos(a1)*radius, shaftRatio*length );
        vertices.push( Math.sin(a2)*radius, Math.cos(a2)*radius, shaftRatio*length );
        vertices.push( 0, 0, length*shaftRatio );
        //shaft
        vertices.push( Math.sin(a1)*shaftRadius, Math.cos(a1)*shaftRadius, shaftRatio*length );
        vertices.push( Math.sin(a2)*shaftRadius, Math.cos(a2)*shaftRadius, shaftRatio*length );
        vertices.push( Math.sin(a1)*shaftRadius, Math.cos(a1)*shaftRadius, zStartOffset );
        vertices.push( Math.sin(a2)*shaftRadius, Math.cos(a2)*shaftRadius, zStartOffset );
        //back of shaft
        vertices.push( Math.sin(a1)*shaftRadius, Math.cos(a1)*shaftRadius, zStartOffset );
        vertices.push( Math.sin(a2)*shaftRadius, Math.cos(a2)*shaftRadius, zStartOffset );
        vertices.push( 0, 0, zStartOffset );

        colors.push(col.x, col.y, col.z, col.a,   col.x, col.y, col.z, col.a,   col.x, col.y, col.z, col.a,  
            col.x, col.y, col.z, col.a,   col.x, col.y, col.z, col.a,   col.x, col.y, col.z, col.a, 
            col.x, col.y, col.z, col.a,  col.x, col.y, col.z, col.a,  col.x, col.y, col.z, col.a,  col.x, col.y, col.z, col.a,
            col.x, col.y, col.z, col.a,  col.x, col.y, col.z, col.a,  col.x, col.y, col.z, col.a,    );
        
        normals.push( Math.sin(a1), Math.cos(a1), 0 );
        normals.push( Math.sin(a2), Math.cos(a2), 0 );
        normals.push( Math.sin(aAvg), Math.cos(aAvg), 0 );
        normals.push( 0, 0, -1);
        normals.push( 0, 0, -1);
        normals.push( 0, 0, -1);
        normals.push( Math.sin(a1), Math.cos(a1), 0 );
        normals.push( Math.sin(a2), Math.cos(a2), 0 );
        normals.push( Math.sin(a1), Math.cos(a1), 0 );
        normals.push( Math.sin(a2), Math.cos(a2), 0 );
        normals.push( 0, 0, -1);
        normals.push( 0, 0, -1);
        normals.push( 0, 0, -1);


        indices.push(indOn, indOn + 2, indOn + 1,  //slant part
            indOn+3, indOn + 4, indOn + 5, //back part
            indOn+6, indOn+7, indOn+8,  indOn+9, indOn+8, indOn+7, //shaft
            indOn+10, indOn+11, indOn+12, //back of shaft
            ); 
        if (enableLines)
        {
            lineIndices.push(indOn, indOn+1, indOn, indOn+2, //slant part
                indOn+3, indOn+5, indOn+4, indOn+5, //back part
                indOn+6, indOn+8, indOn+7, indOn+9, //shaft
                indOn+10, indOn+11, //end of shaft
                );
        } else {
            lineIndices.push(indOn, indOn+1, 
                indOn+10, indOn+11, //end of shaft
                );
        }
        

        indOn += 13;
    }
    

    return {
        type: 'arrow',
        vertices: vertices,
        indices: indices,
        normals: normals,
        colors: colors,
        lineIndices: lineIndices,
    }
}
function generateDoubleArrow(length = 1, radius = 0.2, numDivisions = 6,  color = new vec4(1, 0.4, 0.4, 1), shaftRadius = 0.07, shaftRatio = 0.7, enableLines = false)
{
    let col = color;

    let vertices = [];
    let indices = [];
    let normals = [];
    let colors = [];
    let lineIndices = [];

    let indOn = 0;

    //Front slant part of arrow
    for (var i=0; i<numDivisions; i++)
    {
        let a1 = i * 2 * Math.PI/numDivisions;
        let aAvg = (i+0.5) * 2 * Math.PI/numDivisions;
        let a2 = (i+1) * 2 * Math.PI/numDivisions;

        //Slant part of arrow
        vertices.push( Math.sin(a1)*radius, Math.cos(a1)*radius, shaftRatio*length - length/2);
        vertices.push( Math.sin(a2)*radius, Math.cos(a2)*radius, shaftRatio*length - length/2);
        vertices.push( 0, 0, length - length/2);
        //Back of slant arrow part
        vertices.push( Math.sin(a1)*radius, Math.cos(a1)*radius, shaftRatio*length - length/2);
        vertices.push( Math.sin(a2)*radius, Math.cos(a2)*radius, shaftRatio*length - length/2);
        vertices.push( 0, 0, length*shaftRatio - length/2);
        //shaft
        vertices.push( Math.sin(a1)*shaftRadius, Math.cos(a1)*shaftRadius, shaftRatio*length - length/2);
        vertices.push( Math.sin(a2)*shaftRadius, Math.cos(a2)*shaftRadius, shaftRatio*length - length/2);
        vertices.push( Math.sin(a1)*shaftRadius, Math.cos(a1)*shaftRadius, (1-shaftRatio)*length - length/2);
        vertices.push( Math.sin(a2)*shaftRadius, Math.cos(a2)*shaftRadius, (1-shaftRatio)*length - length/2);
        //back of shaft
        //vertices.push( Math.sin(a1)*shaftRadius, Math.cos(a1)*shaftRadius, 0 );
        //vertices.push( Math.sin(a2)*shaftRadius, Math.cos(a2)*shaftRadius, 0 );
        //vertices.push( 0, 0, 0 );
        //Slant part of arrow2
        vertices.push( Math.sin(a1)*radius, Math.cos(a1)*radius, (1-shaftRatio)*length - length/2);
        vertices.push( Math.sin(a2)*radius, Math.cos(a2)*radius, (1-shaftRatio)*length - length/2);
        vertices.push( 0, 0, 0 - length/2);
        //Back of slant arrow part2
        vertices.push( Math.sin(a1)*radius, Math.cos(a1)*radius, (1-shaftRatio)*length - length/2);
        vertices.push( Math.sin(a2)*radius, Math.cos(a2)*radius, (1-shaftRatio)*length - length/2);
        vertices.push( 0, 0, length*(1-shaftRatio) - length/2);

        colors.push(col.x, col.y, col.z, col.a,   col.x, col.y, col.z, col.a,   col.x, col.y, col.z, col.a,  
            col.x, col.y, col.z, col.a,   col.x, col.y, col.z, col.a,   col.x, col.y, col.z, col.a, 
            col.x, col.y, col.z, col.a,  col.x, col.y, col.z, col.a,  col.x, col.y, col.z, col.a,  col.x, col.y, col.z, col.a,
            //col.x, col.y, col.z, col.a,  col.x, col.y, col.z, col.a,  col.x, col.y, col.z, col.a,
            col.x, col.y, col.z, col.a,   col.x, col.y, col.z, col.a,   col.x, col.y, col.z, col.a,     
            col.x, col.y, col.z, col.a,   col.x, col.y, col.z, col.a,   col.x, col.y, col.z, col.a, 
            );
        
        normals.push( Math.sin(a1), Math.cos(a1), 0 );
        normals.push( Math.sin(a2), Math.cos(a2), 0 );
        normals.push( Math.sin(aAvg), Math.cos(aAvg), 0 );
        normals.push( 0, 0, -1);
        normals.push( 0, 0, -1);
        normals.push( 0, 0, -1);
        normals.push( Math.sin(a1), Math.cos(a1), 0 );
        normals.push( Math.sin(a2), Math.cos(a2), 0 );
        normals.push( Math.sin(a1), Math.cos(a1), 0 );
        normals.push( Math.sin(a2), Math.cos(a2), 0 );
        //normals.push( 0, 0, -1);
        //normals.push( 0, 0, -1);
        //normals.push( 0, 0, -1);
        normals.push( Math.sin(a1), Math.cos(a1), 0 );
        normals.push( Math.sin(a2), Math.cos(a2), 0 );
        normals.push( Math.sin(aAvg), Math.cos(aAvg), 0 );
        normals.push( 0, 0, -1);
        normals.push( 0, 0, -1);
        normals.push( 0, 0, -1);


        indices.push(indOn, indOn + 2, indOn + 1,  //slant part
            indOn+3, indOn + 4, indOn + 5, //back part
            indOn+6, indOn+7, indOn+8,  indOn+9, indOn+8, indOn+7, //shaft
            //indOn+10, indOn+11, indOn+12, //back of shaft

            indOn+10, indOn+11, indOn+12,  //slant part 2
            indOn+13, indOn + 15, indOn + 14, //back part 2
            ); 
        if (enableLines)
        {
            lineIndices.push(indOn, indOn+1, indOn, indOn+2, //slant part
                indOn+3, indOn+5, indOn+4, indOn+5, //back part
                indOn+6, indOn+8, indOn+7, indOn+9, //shaft
                //indOn+10, indOn+11, //end of shaft
                );
        } else {
            lineIndices.push(indOn, indOn+1, 
                indOn+6, indOn+7,
                //indOn+10, indOn+11, //end of shaft
                indOn+10, indOn+11,
                );
        }
        

        indOn += 16;
    }
    

    return {
        type: 'arrow',
        vertices: vertices,
        indices: indices,
        normals: normals,
        colors: colors,
        lineIndices: lineIndices,
    }
}


function rotateData(data = {}, rotation = new vec4())
{
    //Function used for rotating the vertices of a data dictionary
    //Built specifically for the rotation arrows for rotating objects.
    if (data != null && 'vertices' in data)
    {

    } else {
        return data;
    }
    let mat = new mat4().makeRotation(rotation.x, rotation.y, rotation.z);
    let temp = new vec4();
    for (var i=0; i<data.vertices.length; i+=3)
    {
        temp.x = data.vertices[i  ];
        temp.y = data.vertices[i+1];
        temp.z = data.vertices[i+2];
        temp.a = 0;

        temp = mat.mul(temp);

        data.vertices[i  ] = temp.x;
        data.vertices[i+1] = temp.y;
        data.vertices[i+2] = temp.z;
    }
    return data;
}

function translateData(data = {}, translation = new vec4())
{
    //Function used for translating the vertices of a data dictionary
    //Built specifically for the rotation arrows for rotating objects.
    if (data != null && 'vertices' in data)
    {

    } else {
        return data;
    }

    for (var i=0; i<data.vertices.length; i+=3)
    {
        data.vertices[i  ] += translation.x;
        data.vertices[i+1] += translation.y;
        data.vertices[i+2] += translation.z;
    }
    return data;
}


//Cubes
const cubeVertices =  [
    -0.5,0.5,0.5, 0.5,0.5,0.5, 0.5,-0.5,0.5, -0.5,-0.5,0.5, //front
    -0.5,0.5,-0.5, -0.5,-0.5,-0.5, 0.5,-0.5,-0.5, 0.5,0.5,-0.5, //back
    -0.5,0.5,0.5, -0.5,0.5,-0.5, 0.5,0.5,-0.5, 0.5,0.5,0.5, //top
    -0.5,0.5,0.5, -0.5,-0.5,0.5, -0.5,-0.5,-0.5, -0.5,0.5,-0.5, //left
    0.5,0.5,0.5, 0.5,0.5,-0.5, 0.5,-0.5,-0.5, 0.5,-0.5,0.5, //right
    -0.5,-0.5,0.5, 0.5,-0.5,0.5, 0.5,-0.5,-0.5, -0.5,-0.5,-0.5, //bottom
];
const cubeIndices = [
    0,2,1, 0,3,2, //front
    4,6,5, 4,7,6, //back
    8,10,9, 8,11,10, //top
    12,14,13, 12,15,14, //left
    16,18,17, 16,19,18, //right
    20,22,21, 20,23,22, //bottom
];
const cubeNormals = [
    0,0,1, 0,0,1, 0,0,1, 0,0,1,
    0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1,
    0,1,0, 0,1,0, 0,1,0, 0,1,0,
    -1,0,0, -1,0,0, -1,0,0, -1,0,0, //left
    1,0,0, 1,0,0, 1,0,0, 1,0,0, //right
    0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0, //bottom
];
const cubeColors = [
    0.5,0.5,0.5,1, 0.5,0.5,0.5,1, 0.5,0.5,0.5,1, 0.5,0.5,0.5,1,
    0.5,0.5,0.5,1, 0.5,0.5,0.5,1, 0.5,0.5,0.5,1, 0.5,0.5,0.5,1,
    0.5,0.5,0.5,1, 0.5,0.5,0.5,1, 0.5,0.5,0.5,1, 0.5,0.5,0.5,1,
    0.5,0.5,0.5,1, 0.5,0.5,0.5,1, 0.5,0.5,0.5,1, 0.5,0.5,0.5,1,
    0.5,0.5,0.5,1, 0.5,0.5,0.5,1, 0.5,0.5,0.5,1, 0.5,0.5,0.5,1,
    0.5,0.5,0.5,1, 0.5,0.5,0.5,1, 0.5,0.5,0.5,1, 0.5,0.5,0.5,1,
];
const cubeLineIndices = [
    0,1, 1,2, 2,3, 3,0, 
    4,5,5,6,6,7,7,4, 
    0,4, 7,1, 2,6, 5,3
];




//This is all used for Text. It contains all of the triangles necessary for creating each ascii shape
const asciiVertices = [
    0,-0.2,0,0,-0.1,0,0,0,0,0,0.1,0,0,0.2,0,0,0.3,0,0,0.4,0,0,0.5,0,0,0.6,0,0,0.7,0,0,0.8,0,0.1,
    -0.2,0,0.1,-0.1,0,0.1,0,0,0.1,0.1,0,0.1,0.2,0,0.1,0.3,0,0.1,0.4,0,0.1,0.5,0,0.1,0.6,0,0.1,0.7,
    0,0.1,0.8,0,0.2,-0.2,0,0.2,-0.1,0,0.2,0,0,0.2,0.1,0,0.2,0.2,0,0.2,0.3,0,0.2,0.4,0,0.2,0.5,0,
    0.2,0.6,0,0.2,0.7,0,0.2,0.8,0,0.3,-0.2,0,0.3,-0.1,0,0.3,0,0,0.3,0.1,0,0.3,0.2,0,0.3,0.3,0,0.3,
    0.4,0,0.3,0.5,0,0.3,0.6,0,0.3,0.7,0,0.3,0.8,0,0.4,-0.2,0,0.4,-0.1,0,0.4,0,0,0.4,0.1,0,0.4,0.2,
    0,0.4,0.3,0,0.4,0.4,0,0.4,0.5,0,0.4,0.6,0,0.4,0.7,0,0.4,0.8,0
];
const asciiIndices = [
    null,null,null,null,null,null,null,null,null,null,  //0-9
    null,null,null,null,null,null,null,null,null,null,  //10 - 19
    null,null,null,null,null,null,null,null,null,null,  //20 - 29
    null,null,  //30 - 31

    [], // (Space)
    [3,2,13,13,14,3,4,15,21,21,10,4], // !    
    [8,21,32,32,19,8,30,43,54,54,41,30], // "
    [2,20,31,31,13,2,24,42,53,53,35,24,7,51,50,50,6,7,5,49,48,48,4,5], //#
    null,
    [8,7,18,18,19,8,37,36,47,47,48,37,42,2,13,13,53,42], //% 
    null, // &
    [21,8,19,19,32,21], // '
    [7,4,13,13,20,7,20,32,31,31,19,20,13,23,24,24,14,13], // (
    [13,26,29,29,20,13,20,10,9,9,19,20,1,13,2,2,14,13], // )
    [7,21,19,19,29,21,19,9,20,19,31,20], //*
    [6,39,38,38,5,6,18,15,26,26,29,18], // +
    [14,2,1,14,25,24,1,24,14], // ,
    [6,39,38,38,5,6], // -
    [3,14,13,13,2,3], // .
    [1,43,54,54,12,1], //  /

    //Numbers: 48-57
    [13,3,9,9,21,13,21,43,53,53,9,21,53,47,35,35,43,53,47,3,13,13,35,47], //0
    [8,9,21,21,32,8,32,24,13,13,21,32,3,36,35,35,2,3], //1
    [46,2,3,3,47,46,3,52,51,51,2,3,51,53,43,43,39,51,43,21,9,9,53,43,21,9,8,8,19,21], //2
    [4,15,13,13,3,4,3,47,35,35,13,3,8,9,21,21,19,8,9,21,43,43,53,9,53,51,39,39,43,53,47,49,39,39,35,47,40,28,38], //3
    [10,6,17,17,21,10,43,35,46,46,54,43,50,6,7,7,51,50], //4
    [9,53,54,54,10,9,10,6,17,17,21,10,7,40,50,50,6,7,50,47,35,35,40,50,35,13,3,3,47,35,3,4,15,15,13,3],//5
    [3,47,35,35,13,3,3,6,18,18,40,50,50,6,18,18,13,3,50,47,35,35,40,50,17,43,32,32,6,17], //6
    [10,54,53,53,9,10,53,24,13,13,42,53],//7
    [9,21,43,43,53,9,9,7,17,17,21,9,7,51,39,39,17,7,39,43,53,53,51,39,18,6,3,3,13,18,40,50,47,47,35,40,3,47,35,35,13,3],//8
    [17,7,9,9,21,17,21,43,53,53,9,21,53,51,39,39,43,53,39,17,7,7,51,39,51,24,13,13,40,51], //9
    

    //Special characters 58-64
    [7,6,17,17,18,7,15,4,3,3,15,14], // :
    [3,15,12,12,1,3,7,6,17,17,18,7], // ;
    [6,51,52,6,49,48,49,17,6,17,51,6], // <
    [50,6,7,7,51,50,49,5,4,4,48,49], // = 
    [8,50,7,50,5,4,7,39,50,39,5,50], // >
    [18,7,9,9,21,18,21,43,53,53,9,21,53,51,39,39,43,53,40,37,26,26,28,40,25,24,35,36,25,35], // ?
    [48,53,43,43,38,48,43,21,9,9,53,43,9,2,12,12,21,9,2,46,34,34,12,2,28,26,48,48,39,28], //@

    //Uppercase Letters: 65-90
    [2,21,32,32,13,2,43,46,35,35,32,43,21,43,31,17,39,38,38,16,17], // A
    [10,2,13,13,21,10,10,43,53,53,9,10,53,51,39,39,43,53,39,49,47,47,35,39,35,2,3,3,47,35,7,40,39,39,6,7], //B
    [9,21,43,43,53,9,53,52,41,41,43,53,21,13,3,3,9,21,3,47,35,35,13,3,47,48,37,37,35,47], // C
    [10,2,13,13,21,10,52,47,35,35,2,3,3,47,35,41,52,35,10,32,42,42,9,10,42,52,41,41,31,42], //D
    [54,10,9,9,53,54,10,2,13,13,21,10,3,47,46,46,2,3,6,39,38,38,5,6], //E
    [2,10,21,21,13,2,10,54,53,53,9,10,6,39,38,38,5,6], //F
    [52,41,42,52,53,42,53,43,21,9,21,53,9,3,13,13,20,9,3,47,35,35,13,3,27,49,48,48,26,27,37,35,46,46,48,37], //G
    [10,21,13,13,2,10,6,50,49,49,5,6,43,35,46,46,54,43], //H
    [21,13,24,24,32,21,10,43,42,42,9,10,3,36,35,35,2,3], //I
    [10,54,53,53,9,10,43,36,24,24,32,43,24,13,3,3,36,24,3,4,15,15,13,3], //J
    [10,2,13,13,21,10,38,35,46,38,48,46,48,8,7,7,47,48,43,41,53,53,54,43,53,5,6,6,54,53], // K
    [10,2,13,13,21,10,3,47,46,46,2,3], //L
    [2,10,21,21,13,2,35,43,54,54,46,35,21,29,18,29,43,40,18,27,40], //M
    [13,21,10,10,2,13,54,46,35,35,43,54,21,46,35,35,10,21], //N
    [3,13,35,35,47,3,3,9,21,21,13,3,21,43,53,53,9,21,53,47,35,35,43,53], //O
    [10,2,13,13,21,10,10,43,53,53,9,10,53,51,39,39,43,53,39,6,7,7,51,39], //p
    [24,48,37,37,13,24,3,36,24,24,13,3,3,9,21,21,13,3,21,43,53,53,9,21,53,48,37,37,43,53,27,47,46,46,26,27], //Q
    [10,2,13,13,21,10,10,43,53,53,9,10,53,51,39,39,43,53,39,6,7,7,51,39,39,49,46,46,35,39,28,38,39], //R
    [53,43,21,53,9,21,3,13,35,35,47,3,9,7,17,17,21,9,47,49,39,39,35,47,38,17,18,18,39,38,14,4,3,42,52,53], //S
    [10,54,53,53,9,10,32,24,35,35,43,32], //T
    [10,3,13,13,21,10,13,46,47,47,3,13,46,54,43,43,35,46], //U
    [10,24,35,35,21,10,24,43,54,54,35,24], //V
    [10,2,13,13,21,10,43,35,46,46,54,43,13,26,15,26,35,37,15,28,37], //W
    [21,46,35,35,10,21,43,2,13,13,54,43], //X
    [24,28,39,39,35,24,28,10,21,21,39,28,39,54,43,43,28,39], //Y
    [10,54,53,53,9,10,53,14,3,3,42,53,3,2,46,46,47,3], //Z


    //91-96
    [31,32,10,10,9,31,10,1,12,12,21,10,2,24,23,23,1,2], // [
    [10,21,34,34,23,10], // \
    [10,32,31,31,9,10,32,23,12,12,21,32,2,24,23,23,1,2], // ]
    [9,8,21,21,20,8,20,30,31,31,21,20], // ^
    [2,46,45,45,1,2], // _
    [10,19,30,30,21,10], // `

    //Lowercase letters: 97-122
    [46,50,40,40,35,46,35,13,3,3,47,35,40,18,6,6,50,40,3,4,16,16,13,3,16,49,48,48,4,16], //a
    [10,2,13,21,10,13,7,40,50,50,6,7,50,47,35,35,40,50,35,2,3,3,47,35],     //b
    [50,6,18,18,40,50,3,47,35,35,13,3,13,18,6,6,3,13],   //c
    [46,54,43,43,35,46,46,13,3,3,47,46,3,6,18,18,13,3,18,51,50,50,6,18], //d
    [47,3,13,13,35,47,13,3,6,6,18,13,18,40,50,50,6,18,50,49,37,37,40,50,37,4,5,5,49,37], //e
    [13,20,32,32,24,13,32,43,53,53,20,32,53,52,42,7,40,39,39,6,7,42,41,52], //f
    [18,13,3,3,6,18,18,40,50,50,6,18,3,47,46,46,13,3,50,45,33,33,40,50,33,11,1,1,45,33], //g
    [2,10,21,13,2,21,7,40,50,50,6,7,50,46,35,35,40,50], //h
    [13,17,28,13,24,28,19,18,29,29,30,19], //i
    [2,1,11,11,13,2,1,34,22,22,11,1,34,39,28,28,22,34,30,29,40,40,41,30], //j
    [2,10,21,21,13,2,46,35,5,5,16,46,30,5,16,16,41,30], //k
    [10,3,13,13,21,10,14,24,13,14,25,24], //l
    [2,7,18,18,13,2,40,35,46,46,51,40,40,28,39,18,28,17,17,27,39], //m
    [2,6,18,18,13,2,40,35,46,46,51,40,18,51,50,50,6,18], //n
    [3,6,18,18,13,3,18,40,50,50,6,18,3,47,35,35,13,3,47,50,40,40,35,47], //o
    [0,6,18,18,11,0,18,40,50,50,6,18,3,47,35,35,3,2,47,50,40,40,35,47], //p
    [3,6,18,18,13,3,18,40,50,50,6,18,3,47,35,35,13,3,44,50,40,40,33,44], //q
    [13,18,7,7,2,13,6,29,28,28,5,6,29,40,39,39,28,29,40,50,49,49,38,40], //r
    [47,48,38,38,35,47,38,5,15,15,48,38,4,24,13,13,3,4,3,47,35,35,13,3,5,6,18,18,15,5,18,40,50,50,6,18,50,49,29], //s
    [24,14,21,21,32,24,14,36,35,35,24,14,7,40,39,39,6,7], //t
    [7,18,13,13,3,7,3,47,46,46,13,3,35,40,51,51,46,35], //u
    [18,35,24,24,7,18,35,51,40,40,24,35], //v
    [7,2,13,13,18,7,40,35,46,46,51,40,14,27,36,13,25,14,25,35,36], //w
    [46,18,7,7,35,46,13,51,40,40,2,13], //x
    [7,3,13,13,18,7,51,45,33,33,40,51,3,47,46,46,13,3,33,11,1,1,45,33], //y
    [7,51,50,50,6,7,3,47,46,46,2,3,3,39,50,50,14,3], //z         //122

    //Spectials 123-126
    [25,36,35,35,24,25,24,14,16,16,27,24,32,43,42,42,31,32,32,20,18,18,29,32,16,6,18,27,17,16,17,29,18],    // {
    [1,10,21,21,12,1],                                                                                      // |
    [2,3,13,13,14,3,13,25,27,27,16,13,10,21,20,20,9,10,21,31,29,29,18,21,29,39,27,16,28,27,18,28,29],       // }
    [17,5,6,6,18,28,28,40,39,17,27,39], //~

    null, null, null, //127-129
    null, null, null, null, null, null, null, null, null, null, //130-139
    null, null, null, null, null, null, null, null, null, null, //140-149
    null, null, null, null, null, null, null, null, null, null, //150-159
    null, null, null, null, null, null, null, null, null, null, //160-169
    null, null, null, null, null, null, //170-175
    [9,21,32,32,42,9,21,18,8,8,9,21,8,41,29,29,18,8,29,32,42,42,41,29],  //176 - Degree Symbol
    null, null, null, //177-179 
    null, null, null, null, null, null, null, null, null, null, //180-189
    null, null, null, null, null, null, null, null, null, null, //190-199
    null, null, null, null, null, null, null, null, null, null, //200-209
    null, null, null, null, null, null, null, null, null, null, //210-219
    null, null, null, null, null, null, null, null, null, null, //220-229
    null, null, null, null, null, null, null, null, null, null, //230-239
    null, null, null, null, null, null, null, null,  //240-247
    [9,21,32,32,42,9,21,18,8,8,9,21,8,41,29,29,18,8,29,32,42,42,41,29], // Degree Symbol - 248
    null, //249
    null, null, null, null, null, null, null, null, null, null, //250-259
    //
];
const asciiWidths = [
    0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.1, 0.4, 0.4, 0.4, 0.4, 0.4, 0.2, 0.2, 0.2, 0.2, 0.3, 0.2, 0.3, 0.1, 0.4, 0.4, 0.3, 0.4,
    0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.1, 0.1, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.3, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.2, 0.3, 0.2, 0.2, 0.4, 0.2, 0.4, 0.4, 0.4, 0.4, 0.4,
    0.4, 0.4, 0.4, 0.2, 0.3, 0.4, 0.2, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.3, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.3, 0.1, 0.3, 0.3, 0.4,

    0.4,0.4,//128,129
    0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4, //130-169
    0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4, //170-209
    0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4, //210-247
    0.3,
    0.4,//249
    0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,//250-259

];
function computeAsciiWidths_ONLY_NEEDED_ONCE() {
    var widths = [];
    for (var i=0; i<asciiIndices.length; i++)
    {
        var maxInd = 0;
        var width = 0;

        if (asciiIndices[i] == null || asciiIndices[i].length == 0)
        {
            width = 4;
        } else {
            for (var j=0; j<asciiIndices[i].length; j++)
            {
                if (asciiIndices[i][j] > maxInd)
                {
                    maxInd = asciiIndices[i][j];
                }
            }

            if (maxInd < 11) {
                width = 1;
            } else if (maxInd < 22) {
                width = 1;
            } else if (maxInd < 33) {
                width = 2;
            } else if (maxInd < 44) {
                width = 3;
            } else {
                width = 4;
            }
        }

        if (widths.length > 50)
        {
            console.log(widths);
            widths = [];
        }
        widths.push(width/10);
    }

    console.log(widths);
}



