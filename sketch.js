
// Camera streaming object
let gCapture;

// Image object
let gImg = undefined;

// Settings
let gToggleController = true;
let gToggleGrid = true;
let gToggleQuarterLine = true;

const CAMERA_TYPE_USER = 'user';
const CAMERA_TYPE_ENVIRONMENT = 'environment';
let gToggleCameraType = CAMERA_TYPE_ENVIRONMENT;

// Cell unit size(pixel)
const CELL_SIZE_MIN = 3;
const CELL_SIZE_MAX = 30;
const CELL_SIZE_DEFAULT = 10;
let gCellSize = CELL_SIZE_DEFAULT;

// Line level ranges from 0 to 4.
const LINE_LEVEL_MAX = 4;

// For controllers
let gBtToggleGrid = undefined;
let gBtToggleQuarterLine = undefined;
let gBtToggleCameraType = undefined;
let gBtSave = undefined;
let gSliderCellSize = CELL_SIZE_DEFAULT;


function setup() {

  // Canvas and video settings
  createCanvas( displayWidth, displayHeight )
    .mousePressed( toggleController );
  const constraints = {
    audio: false,
    video: {
      facingMode: gToggleCameraType
    } 
  };
  gCapture = createCapture( constraints );
  gCapture.hide();

  // Prepare controllers
  prepareControllers();

}

function draw() {

  gImg = gCapture.get();
  gCellSize = gSliderCellSize.value();
  drawLineSketch();
  
  // Redraw controller
  redrawControllers();

}

// Prapare Controllers
const prepareControllers = () => {

  // Slider Settings
  gSliderCellSize = createSlider( CELL_SIZE_MIN, CELL_SIZE_MAX, CELL_SIZE_DEFAULT );

  gBtToggleGrid = createButton( 'Toggle Grid' );
  gBtToggleGrid.mousePressed( toggleGrid );

  gBtToggleQuarterLine = createButton( 'Toggle Quarter lines' );
  gBtToggleQuarterLine.mousePressed( toggleQuarterLine );

  gBtSave = createButton('Save');
  gBtSave.mousePressed( save );

  gBtToggleCameraType = createButton( 'Switch Camera' );
  gBtToggleCameraType.mousePressed( toggleCamera );

}

// Draw whole line sketch. Main procedure.
const drawLineSketch = () => {

  if( gImg === undefined ){
    return;
  }

  background( 'white' );

  // Resize canvas with image size
  resizeCanvas( gImg.width, gImg.height );
  fill('white');
  rect( 0, 0, width, height );

  // Draw grid first
  drawGrid();

  // Convert image data to gray scale
  gImg.filter( GRAY );

  // Draw lines
  drawLines();

  // Draw Quater lines finally.
  drawQuarterLine();

}

// Draw lines
const drawLines = () => {

  stroke( '#202020' );
  strokeWeight( 1.0 );
  fill( 'white' );

  for( let column = 0; column < height; column += gCellSize ){

    for( let row = 0; row < width; row += gCellSize ){

      // Get pixel color. (Since it's gray-scaled color so all RGB values are same.)
      const color = gImg.get( row, column );
      const grayScaleColor = color[0];

      switch( getLineLevel( grayScaleColor ) ){
        default:
        case 0:
          // No operation.
          break;
        case 1:
          // 2 lines top and bottom
          line( row, column, row + gCellSize, column );
          line( row, column + gCellSize, row + gCellSize, column + gCellSize );
          break;
        case 2:
          // Square
          rect( row, column, gCellSize, gCellSize );   
          break;
        case 3:
          // Square with diagonal line
          rect( row, column, gCellSize, gCellSize );
          line( row, column, row + gCellSize, column + gCellSize );
          break;
        case 4:
          // Square with 2 diagonal lines
          rect( row, column, gCellSize, gCellSize );
          line( row, column, row + gCellSize, column + gCellSize );
          line( row + gCellSize, column, row, column + gCellSize );
          break;
      }
      
    }
  }

}

// Draw base grid.
const drawGrid = () => {

  if( gToggleGrid === false ){
    return;
  }

  stroke( '#BAAFA7' );
  strokeWeight( 1.0 );

  for( let column = 0; column < height; column += gCellSize ){

    for( let row = 0; row < width; row += gCellSize ){

      rect( row, column, gCellSize, gCellSize );

    }

  }

}

// Draw thick vertical/horizontal lines dividing the canvas into 16 regions.
const drawQuarterLine = () => {

  if( gToggleQuarterLine === false ){
    return;
  }

  stroke( 'black' );
  strokeWeight( 2.2 );

  for( let index of [ 1, 2, 3 ] ){

    const qH = index * ( height / 4 );
    line( 0, qH, width, qH );

    const qW = index * ( width / 4 );
    line( qW, 0, qW, height);

  }

}

// Covert gray scale value(0-255) to line level(0-4)
const getLineLevel = ( grayScaleValue ) => {

  const lineLevel = LINE_LEVEL_MAX 
                      - Math.floor( 
                          ( grayScaleValue / 256 ) * ( LINE_LEVEL_MAX + 1 ) 
                        );

  // console.log(grayScaleValue, lineLevel);
  return lineLevel;

}

// Support Key press commands
function keyPressed() {
	
  if( key === 's' || key === 'S' ) {
    save();
  }else if( key === 'z' || key === 'Z' ) {
    toggleGrid();
  }else if( key === 'x' || key === 'X' ) {
    toggleQuarterLine();
  }else if( key === 'c' || key === 'C' ) {
    toggleCamera();
  }else if( keyCode === 32 /* Space */ ) {
    toggleController();
  }

}

// Toggle Grid
const toggleGrid = () => {
  gToggleGrid = !gToggleGrid;
}

// Toggle quarter lines
const toggleQuarterLine = () => {
  gToggleQuarterLine = !gToggleQuarterLine;
}

// Toggle Camera
const toggleCamera = () => {

  if( gToggleCameraType === CAMERA_TYPE_ENVIRONMENT ){
    gToggleCameraType = CAMERA_TYPE_USER;
  }else{
    gToggleCameraType = CAMERA_TYPE_ENVIRONMENT;
  }

  gCapture.remove();
  const constraints = {
    audio: false,
    video: {
      facingMode: gToggleCameraType
    } 
  };
  gCapture = createCapture( constraints );
  gCapture.hide();
  
}

// Toggle Controller setting
const toggleController = () => {

  gToggleController = !gToggleController;

  if( gToggleController === false ){
    
    gBtToggleGrid.hide();
    gBtToggleQuarterLine.hide();
    gBtToggleCameraType.hide();
    gBtSave.hide();
    gSliderCellSize.hide();

  }else{

    gBtToggleGrid.show();
    gBtToggleQuarterLine.show();
    gBtToggleCameraType.show();
    gBtSave.show();
    gSliderCellSize.show();

  }

}

// Re-draw controllers 
const redrawControllers = () => {

  if( gToggleController === false ){
    return;
  }

  // Draw background
  noStroke();
  fill( color( 'rgba( 0, 0, 0, 0.5 )' ) );
  const offset = 10;
  const width = 350;
  const height = 146;
  const cornerRound = 5;
  rect( offset, offset, width, height, cornerRound );

  if( gBtToggleGrid ){
    gBtToggleGrid.position( 20, 54 );
  }

  if( gBtToggleQuarterLine ){
    gBtToggleQuarterLine.position( 120, 54 );
  }

  if( gBtSave ){
    gBtSave.position( 270, 54 );
  }

  if( gSliderCellSize ){
    gSliderCellSize.position( 20, 20 );
  }

  if( gBtToggleCameraType ){
    gBtToggleCameraType.position( 20, 90 );
  }

  // Draw captions
  fill( color( 'white' ) );
  textSize( 15 );
  text( 'Cell size: ' + gCellSize, gSliderCellSize.x * 1.7 + gSliderCellSize.width, 35 );
  text( 'Tap screen to toggle hide/display controllers.', 20, 138 );
  
  // Revert stroke
  stroke( color( 'black' ) );

}
