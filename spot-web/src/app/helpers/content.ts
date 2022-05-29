// Helpers for dealing with content
// Including comment utils like checking for tags and rendering the html

const checkWord = (word: string): boolean => {
  return word.length > 1 && word[0] === '@';
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
// if its an incomplete tag return true; else return false
// if its already a tag move the caret to the end
export const checkWordOnCaret = (): boolean => {
  const range = window.getSelection().getRangeAt(0);
  if (range.collapsed) {
    if (range.startContainer.parentElement.className === 'tag-inline') {
      range.setStart(range.startContainer.parentElement.nextSibling, 0);
      range.collapse(true);
    } else {
      return checkWord(getCurrentWord(range.startContainer, range.startOffset));
    }
  }
  return false;
};
