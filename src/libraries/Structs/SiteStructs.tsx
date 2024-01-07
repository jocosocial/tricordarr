/**
 * The intention of this file is to land any structs that we use in the SiteControllers
 * from Swiftarr.
 */
export interface ConductDocParagraph {
  text?: string;
  list?: string[];
}

export interface ConductDocSection {
  header?: string;
  paragraphs?: ConductDocParagraph[];
}

export interface ConductDocDocument {
  header?: string;
  sections?: ConductDocSection[];
}

export interface ConductDoc {
  codeofconduct?: ConductDocDocument;
  guidelines?: ConductDocDocument;
  twitarrconduct?: ConductDocDocument;
}
