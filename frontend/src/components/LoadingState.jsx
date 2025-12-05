export default function LoadingState() {
    return (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
            </div>
            <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900">Analyzing Comments...</h3>
                <p className="text-sm text-gray-600 mt-1">Fetching and processing video data</p>
            </div>
        </div>
    );
}
