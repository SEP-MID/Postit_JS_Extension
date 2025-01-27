// Hier werden die: Shape-Erstellen Funktionen geschrieben, Referenz auf SVG Library


import inherits from 'inherits';

import {
  isObject,
  assign
} from 'min-dash';


import {
  append as svgAppend,
  attr as svgAttr,
  create as svgCreate,
  classes as svgClasses
} from 'tiny-svg';


import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';


import {
  getLabel
} from '../features/label-editing/LabelUtil';





import {
  getBusinessObject,
  is
} from '../util/ModelUtil';

import {
  getSemantic,
  getRectPath,
  getFillColor,
  getStrokeColor
} from './PostitRendererUtil';

var DEFAULT_FILL_OPACITY = .95;

var TASK_BORDER_RADIUS = 10;

var DEFAULT_TEXT_SIZE = 16;

export default function PostitRenderer(
    config, eventBus, styles, pathMap,
    canvas, textRenderer, priority) {

  BaseRenderer.call(this, eventBus, priority);

  var defaultFillColor = config && config.defaultFillColor,
      defaultStrokeColor = config && config.defaultStrokeColor;

  var computeStyle = styles.computeStyle;





  // Ab hier Funktionen: drawCircle, drawRect, drawPath

  // 1. Funktion: Kreis

  function drawCircle(parentGfx, width, height, offset, attrs) {

    if (isObject(offset)) {
      attrs = offset;
      offset = 0;
    }

    offset = offset || 0;

    attrs = computeStyle(attrs, {
      stroke: 'black',
      strokeWidth: 2,
      fill: 'white'
    });

    if (attrs.fill === 'none') {
      delete attrs.fillOpacity;
    }

    var cx = width / 2,
        cy = height / 2;

    var circle = svgCreate('circle');
    svgAttr(circle, {
      cx: cx,
      cy: cy,
      r: Math.round((width + height) / 4 - offset)
    });
    svgAttr(circle, attrs);

    svgAppend(parentGfx, circle);

    return circle;
  }


  // 2. Funktion Rechteck malen


  function drawRect(parentGfx, width, height, r, offset, attrs) {

    if (isObject(offset)) {
      attrs = offset;
      offset = 0;
    }

    offset = offset || 0;

    attrs = computeStyle(attrs, {
      stroke: 'black',
      strokeWidth: 2,
      fill: 'white'
    });

    var rect = svgCreate('rect');
    svgAttr(rect, {
      x: offset,
      y: offset,
      width: width - offset * 2,
      height: height - offset * 2,
      rx: r,
      ry: r
    });
    svgAttr(rect, attrs);

    svgAppend(parentGfx, rect);

    return rect;
  }


  // 3. Funktion: Pfad malen

  function drawPath(parentGfx, d, offset, attrs) {

    if (isObject(offset)) {
      attrs = offset;
      offset = 0;
    }

    offset = offset || 0;

    attrs = computeStyle(attrs, {
      strokeWidth: 2, // Breite der Kontur
      stroke: 'black', // Farbe der Kontur
    });

    var path = svgCreate('path');

    svgAttr(path,{ d: d });
    svgAttr(path, attrs);

    svgAppend(parentGfx, path);

    return path;
  }


  // 4. Funktion : DrawLine

  /* function drawLine(parentGfx, waypoints, attrs) {
    attrs = computeStyle(attrs, [ 'no-fill' ], {
      stroke: black,
      strokeWidth: 2,
      fill: 'none'
    });

    var line = createLine(waypoints, attrs);

    svgAppend(parentGfx, line);

    return line;
  } */



  function renderLabel(parentGfx, label, options) {

    options = assign({
      size: {
        width: 100
      }
    }, options);

    var text = textRenderer.createText(label || '', options);

    svgClasses(text).add('djs-label');

    svgAppend(parentGfx, text);

    return text;
  }

  function renderEmbeddedLabel(parentGfx, element, align, fontSize) {
    var semantic = getSemantic(element);

    return renderLabel(parentGfx, semantic.name, {
      box: element,
      align: align,
      padding: 5,
      style: {
        fill: getColor(element) === 'black' ? 'white' : 'black',
        fontSize: fontSize || DEFAULT_TEXT_SIZE
      },
    });
  }

  // Neue Funktion für Abstand von ContentBox-Texten
  function renderEmbeddedLabel2(parentGfx, element, align, fontSize) {
    var semantic = getSemantic(element);

    return renderLabel(parentGfx, semantic.name, {
      box: element,
      align: align,
      padding: 40,
      style: {
        fill: getColor(element) === 'black' ? 'white' : 'black',
        fontSize: fontSize || DEFAULT_TEXT_SIZE
      },
    });
  }


  function renderExternalLabel(parentGfx, element) {

    var box = {
      width: 90,
      height: 30,
      x: element.width / 2 + element.x,
      y: element.height / 2 + element.y
    };

    return renderLabel(parentGfx, getLabel(element), {
      box: box,
      fitBox: true,
      style: assign(
        {},
        textRenderer.getExternalStyle(),
        {
          fill: 'black'
        }
      )
    });
  }



  // extension API, use at your own risk
  // Anmerkung Lasse: Was ist das?
  this._drawPath = drawPath;



  // Handler für Square-Shape
  // Besonderheit: weisse und graue Shapes dienen als Moment of truth, daher werden diese mit einem roten Rand gerendert
  this.handlers = {
    'postit:SquarePostit': function(parentGfx, element) {

      var attrs = {
        fill: getFillColor(element, defaultFillColor),
        stroke: getStrokeColor(element, defaultStrokeColor)
      };

      if (!('fillOpacity' in attrs)) {
        attrs.fillOpacity = DEFAULT_FILL_OPACITY;
      }

      var rect = drawRect(parentGfx, element.width, element.height, 0, attrs);


      // eslint-disable-next-line no-constant-condition
      if (getFillColor(element, defaultFillColor) == 'white' || 'green' || 'pink') {
        // eslint-disable-next-line no-redeclare
        var rect = drawRect(parentGfx, element.width, element.height, attrs, {
          stroke: 'black',
          strokeWidth: 2,
          fill: getFillColor(element, defaultFillColor),
          pointerEvents: 'none'
        });
      }



      renderEmbeddedLabel(parentGfx, element, 'center-middle');

      return rect;
    },


    //  Handler für Inhalte / vordefinierte Boxen auf dem Canvas

    'postit:ContentPostit': function(parentGfx, element) {

      var attrs = {
        fill: getFillColor(element, defaultFillColor),
        stroke: getStrokeColor(element, defaultStrokeColor)
      };

      if (!('fillOpacity' in attrs)) {
        attrs.fillOpacity = DEFAULT_FILL_OPACITY;
      }

      var rect = drawRect(parentGfx, element.width, element.height, 0, attrs);


      // eslint-disable-next-line no-constant-condition
      if (getFillColor(element, defaultFillColor) == 'white' || 'green' || 'pink') {
        // eslint-disable-next-line no-redeclare
        var rect = drawRect(parentGfx, element.width, element.height, attrs, {
          stroke: 'black',
          strokeWidth: 2,
          fill: getFillColor(element, defaultFillColor),
          pointerEvents: 'none'
        });
      }

      renderEmbeddedLabel2(parentGfx, element, 'center-top');

      return rect;
    },


    'postit:StagesPostit': function(parentGfx, element) {

      var attrs = {
        fill: getFillColor(element, defaultFillColor),
        stroke: getStrokeColor(element, defaultStrokeColor)
      };

      if (!('fillOpacity' in attrs)) {
        attrs.fillOpacity = DEFAULT_FILL_OPACITY;
      }

      var rect = drawRect(parentGfx, element.width, element.height, 0, attrs);

      renderEmbeddedLabel(parentGfx, element, 'center-middle');

      return rect;
    },




    // Handler für Process-Shape, hier erzeugen wir einen positiven Emoji
    'postit:HappyEmotionPostit': function(parentGfx, element) {

      var attrs = {
        fill: getFillColor(element, defaultFillColor),
        stroke: getStrokeColor(element, defaultStrokeColor)
      };

      if (!('fillOpacity' in attrs)) {
        attrs.fillOpacity = DEFAULT_FILL_OPACITY;
      }

      const d = 'M 0 12 A 1 1 0 0 0 31 20 A 1 1 0 0 0 0 12 Z M 19 10 A 1 1 0 0 0 26 10 A 1 1 0 0 0 19 10 Z M 12 11 A 1 1 0 0 0 5 9 A 1 1 0 0 0 12 11 Z M 7 19 A 1 1 0 0 0 24 19 Z'; // Pfad eingeben
      var rect = drawPath(parentGfx, d, 0, attrs);


      renderEmbeddedLabel(parentGfx, element, 'center-middle');

      return rect;
    },


    // Handler für Process-Shape, hier erzeugen wir einen neutralen Emoji
    'postit:NeutralEmotionPostit': function(parentGfx, element) {

      var attrs = {
        fill: getFillColor(element, defaultFillColor),
        stroke: getStrokeColor(element, defaultStrokeColor)
      };

      if (!('fillOpacity' in attrs)) {
        attrs.fillOpacity = DEFAULT_FILL_OPACITY;
      }

      const d = 'M 0 12 A 1 1 0 0 0 31 20 A 1 1 0 0 0 0 12 Z M 19 10 A 1 1 0 0 0 26 10 A 1 1 0 0 0 19 10 Z M 12 11 A 1 1 0 0 0 5 9 A 1 1 0 0 0 12 11 Z M 7 22 Z L 24 22 Z'; // Pfad eingeben
      var rect = drawPath(parentGfx, d, 0, attrs);


      renderEmbeddedLabel(parentGfx, element, 'center-middle');

      return rect;
    },

    // Handler für Process-Shape, hier erzeugen wir einen traurigen Emoji
    'postit:SadEmotionPostit': function(parentGfx, element) {

      var attrs = {
        fill: getFillColor(element, defaultFillColor),
        stroke: getStrokeColor(element, defaultStrokeColor)
      };

      if (!('fillOpacity' in attrs)) {
        attrs.fillOpacity = DEFAULT_FILL_OPACITY;
      }

      const d = 'M 0 12 A 1 1 0 0 0 31 20 A 1 1 0 0 0 0 12 Z M 19 10 A 1 1 0 0 0 26 10 A 1 1 0 0 0 19 10 Z M 12 11 A 1 1 0 0 0 5 9 A 1 1 0 0 0 12 11 Z M 23 25 A 1 1 0 0 0 8 25 Z'; // Pfad eingeben
      var rect = drawPath(parentGfx, d, 0, attrs);


      renderEmbeddedLabel(parentGfx, element, 'center-middle');

      return rect;
    },


    'postit:TruthPostit': function(parentGfx, element) {

      var attrs = {
        fill: getFillColor(element, defaultFillColor),
        stroke: getStrokeColor(element, defaultStrokeColor)
      };

      if (!('fillOpacity' in attrs)) {
        attrs.fillOpacity = DEFAULT_FILL_OPACITY;
      }

      const d = 'M 0 12 Z M 19 10 A 1 1 0 0 0 7 10 L 13 40 Z Z M 17 45 Z L 17 45 A 1 1 0 0 0 9 51 A 1 1 0 0 0 17 45 Z'; // Pfad eingeben
      var rect = drawPath(parentGfx, d, 0, attrs);


      renderEmbeddedLabel(parentGfx, element, 'center-middle');

      return rect;
    },









    'postit:Group': function(parentGfx, element) {

      var group = drawRect(parentGfx, element.width, element.height, TASK_BORDER_RADIUS, {
        stroke: 'black',
        strokeWidth: 1,
        strokeDasharray: '8,3,1,3',
        fill: 'none',
        pointerEvents: 'none'
      });

      return group;
    },

    'postit:CirclePostit': function(parentGfx, element) {
      var attrs = {
        fill: getFillColor(element, defaultFillColor),
        stroke: getStrokeColor(element, defaultStrokeColor)
      };

      if (!('fillOpacity' in attrs)) {
        attrs.fillOpacity = DEFAULT_FILL_OPACITY;
      }

      var rect = drawCircle(parentGfx, element.width, element.height, attrs);

      renderEmbeddedLabel(parentGfx, element, 'center-middle');

      return rect;
    },
    'postit:TextBox': function(parentGfx, element) {
      var attrs = {
        fill: 'none',
        stroke: 'none'
      };

      var textSize = element.textSize || DEFAULT_TEXT_SIZE;

      var rect = drawRect(parentGfx, element.width, element.height, 0, attrs);

      renderEmbeddedLabel(parentGfx, element, 'center-middle', textSize);

      return rect;
    },
    'postit:Image': function(parentGfx, element) {
      var imageSource = getImageSource(element);

      var gfx;
      if (!imageSource) {

        // default placeholder
        gfx = drawRect(parentGfx, element.width, element.height, 0, {
          fill: '#ccc',
          stroke: '#ccc'
        });

        renderLabel(parentGfx, 'Image Placeholder', {
          box: element,
          align: 'center-middle',
          padding: 5,
          style: {
            fill: 'black',
            fontSize: DEFAULT_TEXT_SIZE
          },
        });

      } else {
        gfx = svgCreate('image', {
          x: 0,
          y: 0,
          width: element.width,
          height: element.height,
          href: getImageSource(element)

        });

        svgAppend(parentGfx, gfx);
      }

      return gfx;
    },



    'label': function(parentGfx, element) {
      return renderExternalLabel(parentGfx, element);
    }
  };




}


inherits(PostitRenderer, BaseRenderer);

PostitRenderer.$inject = [
  'config.postit',
  'eventBus',
  'styles',
  'pathMap',
  'canvas',
  'textRenderer'
];


PostitRenderer.prototype.canRender = function(element) {
  return is(element, 'postit:BoardElement');
};

PostitRenderer.prototype.drawShape = function(parentGfx, element) {
  var type = element.type;
  var h = this.handlers[type];

  /* jshint -W040 */
  return h(parentGfx, element);
};

PostitRenderer.prototype.getShapePath = function(element) {

  return getRectPath(element);
};

// helpers //////////

function getColor(element) {
  var bo = getBusinessObject(element);

  return bo.color || element.color;
}

function getImageSource(element) {
  var bo = getBusinessObject(element);

  return bo.source || element.source;
}

