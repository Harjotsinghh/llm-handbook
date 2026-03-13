interface Props {
    items: { label: string; url: string }[];
}

export default function LinksBlock({ items }: Props) {
    const getDomainLabel = (url: string) => {
        try {
            return new URL(url).hostname.replace(/^www\./, "");
        } catch {
            return "external";
        }
    };

    return (
        <div className="links-block">
            {items.map((link, i) => (
                <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-item"
                >
                    <span className="link-body">
                        <span className="link-label">{link.label}</span>
                        <span className="link-domain">{getDomainLabel(link.url)}</span>
                    </span>
                    <span className="link-arrow">↗</span>
                </a>
            ))}
        </div>
    );
}
