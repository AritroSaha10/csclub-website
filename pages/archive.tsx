export default function UnderConstruction() {
    return (
        <div className="flex flex-col items-center justify-center p-8 h-[80vh]">
            <h1 className="text-4xl text-center mb-4 font-semibold text-white">
                Under Construction <span className="font-normal">🔨</span>
            </h1>

            <p className="text-xl text-center mb-4 text-gray-300">
                Sorry about the inconvienence, but the archive hasn&apos;t been fully built yet. 
            </p>

            <p className="text-xl text-center mb-4 text-gray-300">
                In the meantime, you can view all of the code of our workshops on our GitHub repository.
            </p>

            <a className="group bg-blue-500 duration-75 hover:bg-blue-700 text-white font-semibold px-4 py-2 text-xl rounded-lg" href="https://github.com/jfsscsclub/workshops">
                View GitHub Repository <span className="group-hover:ml-1 duration-150 transition-all">→</span>
            </a>
        </div>
    )
}