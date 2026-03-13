import { inlineMd } from "../../utils/inlineMd";
import { useReferences } from "../../context/ReferencesContext";

interface Props {
    title?: string;
    headers: string[];
    rows: string[][];
}

export default function TableBlock({ title, headers, rows }: Props) {
    const refs = useReferences();
    const md = (t: string) => inlineMd(t, refs);

    return (
        <div className="table-block">
            {title && <div className="table-title">{title}</div>}
            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            {headers.map((h, i) => (
                                <th key={i} dangerouslySetInnerHTML={{ __html: md(h) }} />
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, ri) => (
                            <tr key={ri}>
                                {row.map((cell, ci) => (
                                    <td key={ci} dangerouslySetInnerHTML={{ __html: md(cell) }} />
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
