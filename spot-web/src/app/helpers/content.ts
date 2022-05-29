// Helpers for dealing with content
// Including comment utils like checking for tags and rendering the html

  private const checkWord(word: string, element, position): void => {
    if (word.length > 1 && word[0] === '@') {
      this.tagName = word.slice(1);
      this.showTag = true;
      this.tagElement = element;
      this.tagCaretPosition = position;
    } else {
      this.tagName = '';
      this.showTag = false;
      this.tagElement = null;
      this.tagCaretPosition = null;
    }
  }

  private const getCurrentWord(element, position): string => {
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
  }

  export const getAndCheckWordOnCaret(): void => {
    const range = window.getSelection().getRangeAt(0);
    if (range.collapsed) {
      if (range.startContainer.parentElement.className === 'tag-inline') {
        range.setStart(range.startContainer.parentElement.nextSibling, 0);
        range.collapse(true);
      } else {
        this.checkWord(
          this.getCurrentWord(range.startContainer, range.startOffset),
          range.startContainer,
          range.startOffset
        );
      }
    }
  }
