// Veränderung der Palette, sodass aus dieser ein "Template" erzeugt werden kann ( Process steps, etc. )


import {
  assign
} from 'min-dash';

import COLORS from '../../util/ColorUtil';



/**
 * A palette provider for postit elements.
 */
export default function PaletteProvider(
    palette, create, elementFactory,
    spaceTool, lassoTool, handTool, translate) {



  this._palette = palette;
  this._create = create;
  this._elementFactory = elementFactory;
  this._spaceTool = spaceTool;
  this._lassoTool = lassoTool;
  this._handTool = handTool;
  this._translate = translate;


  palette.registerProvider(this);
}

PaletteProvider.$inject = [
  'palette',
  'create',
  'elementFactory',
  'spaceTool',
  'lassoTool',
  'handTool',
  'translate'
];


PaletteProvider.prototype.getPaletteEntries = function(element) {

  var actions = {},
      create = this._create,
      elementFactory = this._elementFactory,
      spaceTool = this._spaceTool,
      lassoTool = this._lassoTool,
      handTool = this._handTool,
      translate = this._translate;




  // Funktion wird immer aufgerufen wenn ein Element erzeugt wird

  function createAction(type, group, className, title, options) {

    function createListener(event) {
      var shape = elementFactory.createShape(assign({ type: type }, options));
      create.start(event, shape);
    }

    var shortType = type.replace(/^postit:/, '');

    return {
      group: group,
      className: className,
      title: title || translate('Create {type}', { type: shortType }),
      action: {
        dragstart: createListener,
        click: createListener
      }
    };
  }

  /*
  function createImage(event) {
    var shape = elementFactory.createShape({
      type: 'postit:Image'
    });

    create.start(event, shape, {
      hints: { selectImage: true }
    });
  } */


  assign(actions, {
    'hand-tool': {
      group: 'tools',
      className: 'pjs-handTool',
      title: translate('Activate the hand-tool'),
      action: {
        click: function(event) {
          handTool.activateHand(event);
        }
      }
    },
    'lasso-tool': {
      group: 'tools',
      className: 'pjs-lassoTool',
      title: translate('Activate the lasso-tool'),
      action: {
        click: function(event) {
          lassoTool.activateSelection(event);
        }
      }
    },
    'space-tool': {
      group: 'tools',
      className: 'pjs-spaceTool',
      title: translate('Activate the space-tool'),
      action: {
        click: function(event) {
          spaceTool.activateSelection(event);
        }
      }
    },



    'tool-separator': {
      group: 'tools',
      separator: true
    },


    // Erstellen der Viereck Form
    'create.square-postit': createAction(
      'postit:SquarePostit', 'postits', 'pjs-postit-square2',
      translate('Add new element'), { color: COLORS.GREEN }
    ),








    // Content Bereich, in diesen können Sticker gezogen werden

    'create.content-postit': createAction(
      'postit:ContentPostit', 'postits', 'pjs-postit-square3',
      translate('Add new content-element'),
    ),

    'postit-separator': {
      group: 'postits',
      separator: true
    },

    // 'create.image': {
    //  group: 'artifact',
    //  className: 'pjs-bild',
    //  title: translate('Bild einfügen'),
    //  action: {
    //    click: createImage,
    //    dragstart: createImage
    //  }
    // },


    'create.text-box': createAction(
      'postit:TextBox', 'artifact', 'pjs-text-box',
      translate('Add text')
    ),
    'create.group': createAction(
      'postit:Group', 'artifact', 'pjs-group',
      translate('Add group')
    ),

    // Erstellen der neuen SVG Shape --> Path; to-do: Anpassen des 1. Parameter (Type): Path: M 2 3 L 10 3 L 13 6 L 10 9 L 2 9 L 2 3
    // Darstellung von Emotionen
    // CSS des kleinen Icons kann hier geändert werden: PostitJS.CSS -->  .pjs-postit-process

    'create.happy-postit': createAction(
      'postit:HappyEmotionPostit', 'postits', 'pjs-happyEmoji',
      translate('Add positive customer emotion'),
    ),

    'create.neutral-postit': createAction(
      'postit:NeutralEmotionPostit', 'postits', 'pjs-neutralEmoji',
      translate('Add neutral customer emotion'),
    ),

    'create.sad-postit': createAction(
      'postit:SadEmotionPostit', 'postits', 'pjs-sadEmoji',
      translate('Add negative customer emotion'),
    ),

    'create.truth-postit': createAction(
      'postit:TruthPostit', 'postits', 'pjs-truth',
      translate('Add moment of truth'),
    )


  });

  return actions;
};
