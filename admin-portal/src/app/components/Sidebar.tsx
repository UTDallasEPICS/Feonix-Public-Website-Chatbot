'use client';
import Link from 'next/link';
import { FaFileAlt, FaPlusSquare, FaSearch } from 'react-icons/fa';

export default function Sidebar() {
    return (
        <div className="bg-black text-accent h-screen w-64 flex flex-col justify-between py-6">
            <div>
                <h1 className="text-white text-2xl font-bold px-6 mb-8 border-b border-accent pb-2">
                    Admin Dashboard
                </h1>

                <ul className="space-y-6 px-6">
                    <li>
                        <Link href="/file-manager" className="flex items-center gap-3 hover:text-white">
                            <FaFileAlt /> File Manager
                        </Link>
                    </li>
                    <li>
                        <Link href="/add-file" className="flex items-center gap-3 hover:text-white">
                            <FaPlusSquare /> Add File
                        </Link>
                    </li>
                    <li>
                        <Link href="/file-search" className="flex items-center gap-3 hover:text-white">
                            <FaSearch /> File Search
                        </Link>
                    </li>
                </ul>
            </div>

            <div className="px-6">
                <img src="/logo.png" alt="Logo" className="w-24 mx-auto opacity-80" />
            </div>
        </div>
    );
}