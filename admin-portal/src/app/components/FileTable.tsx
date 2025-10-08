export default function FileTable() {
    const files = [
        { name: "data.pdf", size: "6.7 MB", type: "PDF", date: "Sep 17, 2025" },
        { name: "example.doc", size: "1.7 GB", type: "DOC", date: "Sep 17, 2025" },
        { name: "data2.PNG", size: "2.7 KB", type: "PNG", date: "Sep 17, 2025" },
    ];

    return (
        <div className="bg-white p-6 rounded-lg shadow-md w-full">
            <h2 className="text-2xl font-semibold text-purple-700 mb-4">File Manager</h2>
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-gray-100 text-left text-gray-600 uppercase text-sm">
                        <th className="p-3">Name</th>
                        <th className="p-3">Size</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {files.map((file, i) => (
                        <tr key={i} className="border-b hover:bg-gray-50">
                            <td className="p-3">{file.name}</td>
                            <td className="p-3">{file.size}</td>
                            <td className="p-3">{file.type}</td>
                            <td className="p-3">{file.date}</td>
                            <td className="p-3 space-x-2">
                                <button className="bg-viewBtn text-white px-3 py-1 rounded text-sm hover:opacity-90">
                                    👁 View
                                </button>
                                <button className="bg-removeBtn text-white px-3 py-1 rounded text-sm hover:opacity-90">
                                    🗑 Remove
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}