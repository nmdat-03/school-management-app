const Loading = () => {
    return (
        <div className="min-h-screen bg-gray-50 p-8 animate-pulse">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">

                {/* LEFT PANEL */}
                <div className="bg-white rounded-md p-6 shadow-md flex flex-col items-center">
                    <div className="w-24 h-24 bg-gray-200 rounded-full mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded w-32 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-20 mb-6"></div>
                    <div className="w-full h-24 bg-gray-200 rounded-md"></div>
                </div>

                {/* RIGHT PANEL */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-md shadow-md p-6">
                        <div className="h-5 bg-gray-200 rounded w-40 mb-4"></div>
                        <div className="h-24 bg-gray-200 rounded-md"></div>
                    </div>
                    <div className="bg-white rounded-md shadow-md p-6">
                        <div className="h-5 bg-gray-200 rounded w-44 mb-4"></div>
                        <div className="h-24 bg-gray-200 rounded-md"></div>
                    </div>
                    <div className="bg-white rounded-md shadow-md p-6">
                        <div className="h-5 bg-gray-200 rounded w-28 mb-4"></div>
                        <div className="h-20 bg-gray-200 rounded-md"></div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Loading;