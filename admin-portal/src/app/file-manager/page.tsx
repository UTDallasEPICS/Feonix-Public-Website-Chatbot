import FileTable from "../components/FileTable";
import Header from "../components/Header";

export default function FileManagerPage() {
    return (
        <div className="w-full">
            <Header />
            <FileTable />
        </div>
    );
}