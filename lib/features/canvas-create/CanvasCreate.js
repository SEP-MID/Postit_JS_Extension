import {
  delegate as domDelegate
} from 'min-dom';

import {
  assign
} from 'min-dash';

import {
  getBusinessObject
} from '../../util/ModelUtil';

import COLORS from '../../util/ColorUtil';

import {
  toPoint
} from 'diagram-js/lib/util/Event';
import { isAny } from '../modeling/util/ModelingUtil';

// Default Process Shape

var DEFAULT_SHAPE = {
  type: 'postit:PathPostit',
  color: COLORS.GREEN,
  $instanceOf: function() { return true; }
};

// Default Shape 2: Square

var DEFAULT_SHAPE2 = {
  type: 'postit:SquarePostit',
  color: COLORS.GREEN,
  $instanceOf: function() { return true; }
};


export default function CanvasCreate(
    eventBus, elementFactory, canvas, directEditing, modeling) {

  var lastCreatedShape = DEFAULT_SHAPE;
  var lastCreatedShape2 = DEFAULT_SHAPE2;

  function _getNewShapePosition(event) {
    var eventPoint = toPoint(event);

    return {
      x: eventPoint.x,
      y: eventPoint.y
    };
  }

  function _activateDirectEdit(element) {
    if (isAny(element, [ 'postit:Postit', 'postit:Group', 'postit:TextBox' ])) {

      directEditing.activate(element);
    }
  }

  function _createShapeOnCanvas(event) {
    var position = _getNewShapePosition(event);

    var newShape = elementFactory.createPostitElement(
      'shape', assign(lastCreatedShape, position));

    var root = canvas.getRootElement();

    var createdShape = modeling.createShape(newShape, position, root);

    _activateDirectEdit(createdShape);
  }


// 2. Shape Art auf Canvas erzeugen 

function _createShapeOnCanvas2(event) {
  var position = _getNewShapePosition(event);

  var newShape = elementFactory.createPostitElement(
    'shape', assign(lastCreatedShape2, position));

  var root = canvas.getRootElement();

  var createdShape = modeling.createShape(newShape, position, root);

  _activateDirectEdit(createdShape);
}









  function _saveLastCreatedShape(shape) {
    if (!shape) {
      lastCreatedShape = DEFAULT_SHAPE;
      return;
    }

    var bo = getBusinessObject(shape);

    lastCreatedShape = {
      type: shape.type,
      color: shape.color || bo.color,
      $instanceOf: function(type) {
        return (typeof bo.$instanceOf === 'function') && bo.$instanceOf(type);
      }
    };
  }



  function _saveLastCreatedShape2(shape) {
    if (!shape) {
      lastCreatedShape2 = DEFAULT_SHAPE2;
      return;
    }

    var bo = getBusinessObject(shape);

    lastCreatedShape2 = {
      type: shape.type,
      color: shape.color || bo.color,
      $instanceOf: function(type) {
        return (typeof bo.$instanceOf === 'function') && bo.$instanceOf(type);
      }
    };
  }


  eventBus.on('canvas.init', function(context) {
    var svg = context.svg;

    domDelegate.bind(svg, 'svg', 'dblclick', function(event) {
      if (event.target !== svg) {
        return;
      }

      _createShapeOnCanvas(event);
      _createShapeOnCanvas2(event);

    });

    eventBus.on('create.end', function(context) {
      var shape = context.shape;
      _saveLastCreatedShape(shape);
      _saveLastCreatedShape2(shape);
    });
  });
}

CanvasCreate.prototype.$inject = [
  'eventBus',
  'elementFactory',
  'canvas',
  'directEditing',
  'modeling'
];