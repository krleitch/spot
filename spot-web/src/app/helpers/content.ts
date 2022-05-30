// Models
import { Tag } from '@models/comment';

// Assets
import { COMMENT_CONSTANTS } from '@constants/comment';

// Helpers for dealing with content
// Including comment utils like checking for tags and rendering the html

//------------------------------------------------------------------//
//                               Tags                               //
//------------------------------------------------------------------//

const checkWord = (word: string): string | null => {
  return word.length > 1 && word[0] === '@' ? word : null;
};

// return the word in element at the the offset of position
const getCurrentWord = (element: Node, position: number): string => {
  // Get content of div
  const content = element.textContent;

  // Check if clicked at the end of word
  position = content[position] === ' ' ? position - 1 : position;

  // Get the start and end index
  let startPosition = content.lastIndexOf(' ', position);
  let endPosition = content.indexOf(' ', position);

  // Special cases
  startPosition = startPosition === content.length ? 0 : startPosition;
  endPosition = endPosition === -1 ? content.length : endPosition;

  return content.substring(startPosition + 1, endPosition);
};

// Check the word under the caret
// if its an incomplete tag return the string; else return null
// if its already a tag move the caret to the end
export const checkWordOnCaret = (range: Range): string | null => {
  if (range.collapsed) {
    if (range.startContainer.parentElement.className === 'tag-inline') {
      range.setStart(range.startContainer.parentElement.nextSibling, 0);
      range.collapse(true);
    } else {
      return checkWord(getCurrentWord(range.startContainer, range.startOffset));
    }
  }
  return null;
};

/**
 * @param element - the element that contains the word that needs to be remove
 * @param position - the start offset inside the container
 * @param username - the username which the tag object should refer
 * @returns the html content content with the old word removed
 */
export const removeWordCreateTag = (
  element: Node,
  position: number,
  username: string
): HTMLElement => {
  const content = element.textContent;

  // Check if clicked at the end of word
  position = content[position] === ' ' ? position - 1 : position;

  let startPosition = content.lastIndexOf(' ', position);
  let endPosition = content.indexOf(' ', position);

  // Special cases
  startPosition = startPosition === content.length ? 0 : startPosition;
  endPosition = endPosition === -1 ? content.length : endPosition;

  const parent = element.parentNode;

  const span = document.createElement('span');
  const beforeText = document.createTextNode(
    content.substring(0, startPosition + 1)
  );
  const tag = document.createElement('span');
  tag.className = 'tag-inline';
  tag.contentEditable = 'false';
  const usernameText = document.createTextNode(username);
  tag.appendChild(usernameText);
  const afterText = document.createTextNode(content.substring(endPosition));
  span.appendChild(beforeText);
  span.appendChild(tag);
  span.appendChild(afterText);

  parent.replaceChild(span, element);
  return tag;
};

//------------------------------------------------------------------//
//                             Content                              //
//------------------------------------------------------------------//

// Returns the content that will be shown and truncates if need be
const parseContent = (
  content: string,
  isExpandable: boolean,
  expanded: boolean
): string => {
  if (expanded || !isExpandable) {
    return content;
  }

  const textArrays = content.split(/\r\n|\r|\n/);
  let truncatedContent = '';

  for (
    let i = 0;
    i < textArrays.length && i < COMMENT_CONSTANTS.MAX_LINE_TRUNCATE_LENGTH;
    i++
  ) {
    if (
      truncatedContent.length + textArrays[i].length >
      COMMENT_CONSTANTS.MAX_TRUNCATE_LENGTH
    ) {
      truncatedContent = textArrays[i].substring(
        0,
        COMMENT_CONSTANTS.MAX_TRUNCATE_LENGTH - truncatedContent.length
      );
      break;
    } else {
      truncatedContent += textArrays[i];
      // Dont add newline for last line or last line before line length reached
      if (
        i !== textArrays.length - 1 &&
        i !== COMMENT_CONSTANTS.MAX_LINE_TRUNCATE_LENGTH - 1
      ) {
        truncatedContent += '\n';
      }
    }
  }

  return truncatedContent;
};

/**
 * @param content - the plaintext content
 * @param tags - tags embedded in the content
 * @param isExpandable - is the content large enough it can be expanded and collapsed
 * @param expanded - is the content currently expanded
 * @returns the innerHTML string
 */
export const parseContentHTML = (
  content: string,
  tags: Tag[],
  isExpandable: boolean,
  expanded: boolean
): string => {
  // Get the content strings
  const parsedContent = parseContent(content, isExpandable, expanded);
  const div = document.createElement('div');
  let lastOffset = 0;

  // Important
  // Tags must be given in asc order of their offset
  // Server should do this for you
  if (tags.length > 0) {
    tags.forEach((tag: Tag) => {
      // check if tag should even be shown
      if (tag.offset <= parsedContent.length || expanded) {
        // create the span that will hold the tag
        const span = document.createElement('span');
        // fill with text leading up to the tag
        const textBefore = document.createTextNode(
          parsedContent.substring(
            lastOffset,
            Math.min(tag.offset, content.length)
          )
        );
        // create the tag and give the username
        const inlineTag = document.createElement('span');
        inlineTag.className = 'tag-inline-comment';

        // <span class="material-icons"> person </span>
        if (tag.username) {
          const username = document.createTextNode(
            tag.username ? tag.username : '???'
          );
          inlineTag.appendChild(username);
        } else {
          // we don't know the person

          const inlineTagIcon = document.createElement('span');

          inlineTagIcon.textContent = 'person';
          inlineTagIcon.className = 'material-icons tag-inline-comment-icon';

          const username = document.createTextNode('???');

          inlineTag.appendChild(inlineTagIcon);
          inlineTag.appendChild(username);
        }

        // Add them to the span
        span.appendChild(textBefore);
        span.appendChild(inlineTag);

        // update the lastOffset
        lastOffset = Math.min(tag.offset, parsedContent.length);

        div.appendChild(span);
      } else {
        // fill in the rest of the content from the last tag
        const textContent = document.createTextNode(
          parsedContent.substring(lastOffset)
        );
        div.appendChild(textContent);
        lastOffset = parsedContent.length;
      }
    });
  } else {
    // No tags, just add the text content
    const textContent = document.createTextNode(parsedContent);
    div.appendChild(textContent);
    lastOffset = parsedContent.length;
  }

  // if there is still content left
  if (lastOffset < parsedContent.length) {
    const after = document.createTextNode(content.substring(lastOffset));
    div.appendChild(after);
  }

  // Add ellipsis if its expandable and isnt expanded
  if (isExpandable && !expanded) {
    const ellipsis = document.createTextNode(' ...');
    div.appendChild(ellipsis);
  }

  return div.innerHTML;
};

/**
 * @param content - the innerHTML string
 * @returns the text content and tags seperately
 */
export const parseContentWithTags = (
  content: string
): { content: string; tags: Tag[] } => {
  // parse the innerhtml to return a string with newlines instead of innerhtml
  const parser = new DOMParser();
  const parsedHtml = parser.parseFromString(content, 'text/html');

  const body = parsedHtml.getElementsByTagName('body');

  const tags: Tag[] = [];
  let text = '';
  let offset = 0;

  // Do a dfs on the html tree
  let stack = [];
  stack = stack.concat([].slice.call(body[0].childNodes, 0).reverse());

  while (stack.length > 0) {
    const elem = stack.pop();

    // A tag
    if (elem.className === 'tag-inline') {
      const tag: Tag = {
        username: elem.textContent,
        offset
      };
      tags.push(tag);
      // A tag has no children, continue
      continue;
    }

    // Push the children
    // In reverse because we want to parse the from left to right
    if (elem.childNodes) {
      stack = stack.concat([].slice.call(elem.childNodes, 0).reverse());
    }

    // Don't add spaces to start
    if (elem.tagName === 'DIV') {
      // A new Div
      text += '\n';
      offset += 1;
    } else if (elem.nodeType === 3) {
      // Text Node
      text += elem.textContent;
      offset += elem.textContent.length;
    }
  }

  // TODO: cleanup whitespace here if decide to do it
  // There should already be no spaces at start, this should just remove - check text length 0 before append \n
  // spaces at the end
  // tag offsets will be adjusted on the server to never be more than content length
  return { content: text, tags: tags };
};
