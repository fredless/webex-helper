export interface UriSchemeHandler {
	scheme: string;
	pattern: RegExp;
	classify(uri: string): string;
}

export class UriHandlerRegistry {
	private handlers: UriSchemeHandler[] = [];

	register(handler: UriSchemeHandler): void {
		this.handlers.push(handler);
	}

	convert(text: string, labels: Record<string, string>): string {
		// Split text into segments: markdown links (preserved) and raw text (converted).
		// This avoids double-converting URIs already inside [text](uri).
		const mdLinkPattern = /\[[^\]]*\]\([^)]*\)/g;
		const parts: { text: string; isLink: boolean }[] = [];
		let lastIndex = 0;

		for (const match of text.matchAll(mdLinkPattern)) {
			if (match.index > lastIndex) {
				parts.push({ text: text.slice(lastIndex, match.index), isLink: false });
			}
			parts.push({ text: match[0], isLink: true });
			lastIndex = match.index + match[0].length;
		}
		if (lastIndex < text.length) {
			parts.push({ text: text.slice(lastIndex), isLink: false });
		}

		// Only convert URIs in non-link segments
		const converted = parts.map((part) => {
			if (part.isLink) return part.text;
			let result = part.text;
			for (const handler of this.handlers) {
				handler.pattern.lastIndex = 0;
				result = result.replace(handler.pattern, (uri) => {
					const defaultLabel = handler.classify(uri);
					const label = labels[defaultLabel] ?? defaultLabel;
					return `[${label}](${uri})`;
				});
			}
			return result;
		});

		return converted.join("");
	}
}

export class WebexUriHandler implements UriSchemeHandler {
	scheme = "webexteams";
	pattern = /webexteams:\/\/im\?[A-Za-z0-9&=_\-%.]+/g;

	classify(uri: string): string {
		const params = uri.split("?")[1] ?? "";
		return params.includes("message=") ? "Webex message" : "Webex space";
	}
}
