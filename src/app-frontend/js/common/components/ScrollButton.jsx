import { createElement } from 'react';
import { Helpers } from 'react-scroll';

/*
 * A custom ScrollButton component because we want
 * <button> tags rather than <a> tags which come with
 * the default Link component in react-scroll.
 *
 * Modeled on
 * https://github.com/fisshy/react-scroll/blob/master/modules/components/Link.js
 */

function Button(props) {
    return createElement('button', props, props.children);
}

export default Helpers.Scroll(Button); // eslint-disable-line new-cap
