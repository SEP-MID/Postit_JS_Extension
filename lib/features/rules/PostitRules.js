import {
  every
} from 'min-dash';

import inherits from 'inherits';

import {
  is
} from '../../util/ModelUtil';

import {
  isLabel
} from '../../util/LabelUtil';



// RulerPovider --> Grundregeln von DiagramJS 
import RuleProvider from 'diagram-js/lib/features/rules/RuleProvider';
import { isAny } from '../modeling/util/ModelingUtil';


/**
 * Postit specific modeling rule
 */
export default function PostitRules(eventBus) {
  RuleProvider.call(this, eventBus);
}

inherits(PostitRules, RuleProvider);

PostitRules.$inject = [ 'eventBus' ];

PostitRules.prototype.init = function() {

  this.addRule('shape.resize', function(context) {

    var shape = context.shape,
        newBounds = context.newBounds;

    return canResize(shape, newBounds);
  });

  this.addRule('elements.create', function(context) {
    var elements = context.elements,
        position = context.position,
        target = context.target;

    return every(elements, function(element) {
      if (element.host) {
        return canAttach(element, element.host, null, position);
      }

      return canCreate(element, target, null, position);
    });
  });

  this.addRule('elements.move', function(context) {

    var target = context.target,
        shapes = context.shapes,
        position = context.position;

    return canAttach(shapes, target, null, position) ||
           canMove(shapes, target, position);
  });

  this.addRule('shape.create', function(context) {
    return canCreate(
      context.shape,
      context.target,
      context.source,
      context.position
    );
  });

  this.addRule('shape.attach', function(context) {

    return canAttach(
      context.shape,
      context.target,
      null,
      context.position
    );
  });

  this.addRule('element.copy', function(context) {
    var element = context.element,
        elements = context.elements;

    return canCopy(elements, element);
  });



  // Neue Regel wird über den Operator: #addRule(action, fn) deklariert
  
};

PostitRules.prototype.canMove = canMove;

PostitRules.prototype.canAttach = canAttach;

PostitRules.prototype.canDrop = canDrop;

PostitRules.prototype.canCreate = canCreate;

PostitRules.prototype.canReplace = canReplace;

PostitRules.prototype.canResize = canResize;

PostitRules.prototype.canCopy = canCopy;

/**
 * Utility functions for rule checking
 */

function isSame(a, b) {
  return a === b;
}

function getParents(element) {

  var parents = [];

  while (element) {
    element = element.parent;

    if (element) {
      parents.push(element);
    }
  }

  return parents;
}

function isParent(possibleParent, element) {
  var allParents = getParents(element);
  return allParents.indexOf(possibleParent) !== -1;
}

function isGroup(element) {
  return is(element, 'postit:Group') && !element.labelTarget;
}






// In diesem Abschnitt geben wir die Regeln an, welche Elemente (Square, Circle, Path, etc)
// in welche Elemente eingefügt werden dürfen 




/**
 * Can an element be dropped into the target element
 *
 * @return {Boolean}
 */
function canDrop(element, target) {

  // can move labels
  if (isLabel(element) || isGroup(element)) {
    return true;
  }

  // Neue Customer Journey Stage hinzufügen auf das Board
  if (is(element, 'postit:PathPostit') && is(target, 'postit:PostitBoard')) {
    return true;
  }

  //Neuen Platzhalter für den Journey Step auf das Board hinzufügen
  if (is(element, 'postit:ContentPostit') && is(target, 'postit:PostitBoard')) {
    return true;
  }

  // Square-ELemente in den Content-Bereich ziehen
  if (is(element, 'postit:SquarePostit') && is(target, 'postit:ContentPostit')) {
    return true;
  }

  // Neue Textbox hinzufügen hinzufügen auf das Board
  if (is(element, 'postit:TextBox') && is(target, 'postit:ContentPostit')) {
    return true;
  }

  // Neuen roten Kreis-Pin an Sqaures hinzufügen 
  if (is(element, 'postit:CirclePostit') && is(target, 'postit:SquarePostit')) {
    return true;
  }

  return false;
}

function canReplace(elements, target) {

  if (!target) {
    return false;
  }

  return true;
}


function canAttach(elements, target) {

  if (!Array.isArray(elements)) {
    elements = [ elements ];
  }

  // only (re-)attach one element at a time
  if (elements.length !== 1) {
    return false;
  }

  var element = elements[0];

  // do not attach labels
  if (isLabel(element)) {
    return false;
  }

  if (is(target, 'postit:BoardElement')) {
    return false;
  }

  // Erlaubt dem Square Element sich an Content anzuhängen
  //if (is(element, 'postit:SquarePostit') && is(target, 'postit:ContentPostit')) {
  //  return true;
  //}

  return 'attach';
}


function canMove(elements, target) {

  // allow default move check to start move operation
  if (!target) {
    return true;
  }

  return elements.every(function(element) {
    return canDrop(element, target);
  });
}

function canCreate(shape, target, source, position) {

  if (!target) {
    return false;
  }

  if (isLabel(shape) || isGroup(shape)) {
    return true;
  }

  if (isSame(source, target)) {
    return false;
  }

  // ensure we do not drop the element
  // into source
  if (source && isParent(source, target)) {
    return false;
  }

  return canDrop(shape, target, position);
}

function canResize(shape, newBounds) {

  if (isAny(shape, [ 'postit:Postit', 'postit:TextBox' ])) {
    return !newBounds || (newBounds.width >= 50 && newBounds.height >= 50);
  }

  if (is(shape, 'postit:Group')) {
    return true;
  }

  if (is(shape, 'postit:Image')) {
    return true;
  }

  return false;
}

function canCopy(elements, element) {
  return true;
}
