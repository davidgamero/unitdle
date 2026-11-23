export const iconFile = (emoji: string) => [...emoji].filter(character => character.codePointAt(0) !== 0xfe0f).map(character => character.codePointAt(0)!.toString(16)).join('-') + '.svg';
