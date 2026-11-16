import Foundation

/// Plain-text rendering of the Markdown the server puts in notification bodies.
public enum MarkdownText {
	/**
	 Strips Markdown syntax (headers, emphasis, links, code) so a notification body reads as plain text.
	 Blocks (paragraphs, headers, list items) are separated by a newline, since Foundation keeps that
	 structure in attributes rather than in the text. Returns `markdown` unchanged if it cannot be parsed.
	 */
	public static func plainText(_ markdown: String) -> String {
		guard let attributed = try? AttributedString(markdown: markdown) else {
			return markdown
		}
		var result = ""
		var previousBlock: Int?
		for run in attributed.runs {
			// The innermost component is the block the run belongs to (a paragraph inside a list item, say).
			let block = run.presentationIntent?.components.first?.identity
			if let previousBlock, block != previousBlock {
				result += "\n"
			}
			result += String(attributed[run.range].characters)
			previousBlock = block
		}
		return result.trimmingCharacters(in: .whitespacesAndNewlines)
	}
}
