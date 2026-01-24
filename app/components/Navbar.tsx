import { Bell, MessageSquareMore, Search } from 'lucide-react';
import Image from 'next/image';

const Navbar = () => {
    return (
        <div className="flex items-center justify-between p-4">
            {/* SEARCH BAR */}
            <div className="hidden md:flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2">
                <Search />
                <input type='text' placeholder='Search...' className='w-[200px] p-2 bg-transparent outline-none' />
            </div>
            {/* ICONS AND USER */}
            <div className="w-full flex items-center gap-6 justify-end">
                {/* Message */}
                <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center cursor-pointer">
                    <MessageSquareMore size={18} />
                </div>
                {/* Notification */}
                <div className="relative w-9 h-9 bg-white rounded-full flex items-center justify-center cursor-pointer">
                    <Bell size={18} />
                    <div className='absolute w-5 h-5 -top-2 -right-2 flex items-center justify-center rounded-full text-xs text-white bg-red-600'>1</div>
                </div>
                {/* User */}
                <div className='flex items-center gap-4 bg-white px-4 py-2 rounded-full'>
                    <div className="hidden md:flex md:flex-col">
                        <span className='text-xs leading-3 font-medium'>John Doe</span>
                        <span className='text-[10px] text-gray-500 text-right'>Admin</span>
                    </div>
                    <div className="relative shrink-0 w-9 h-9 rounded-full overflow-hidden">
                        <Image
                            src="https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=1200"
                            alt="avatar"
                            fill
                            className="object-cover"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Navbar