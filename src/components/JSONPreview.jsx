/**
 * @param {{data: unknown; indentWidth?: number}} param0
 */
export function JSONPreview({ data, indentWidth = 4 }) {
    return (
        <div className="font-mono text-sm border p-4">
            <pre>{JSON.stringify(data, null, indentWidth)}</pre>
        </div>
    );
}
