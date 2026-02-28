import { currentUser } from '@clerk/nextjs/server';
import { Bell, MessageSquareMore, Search } from 'lucide-react';
import { getUserProfile } from "@/lib/getUserProfile";
import UserMenu from "@/components/UserMenu";

const Navbar = async () => {

    const user = await currentUser()

    let profileImg: string | null = null;
    let profileName: string | null = null;
    let role: string | undefined;

    if (user) {
        role = user.publicMetadata.role as string | undefined;

        const profile = role ? await getUserProfile(user.id, role) : null;

        profileImg = profile?.img ?? null;

        profileName = profile ? `${profile.name} ${profile.surname}` : user.fullName ?? user.username ?? "User";
    }

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
                <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center cursor-pointer shadow-md">
                    <MessageSquareMore size={18} />
                </div>
                {/* Notification */}
                <div className="relative w-9 h-9 bg-white rounded-full flex items-center justify-center cursor-pointer shadow-md">
                    <Bell size={18} />
                    <div className='absolute w-5 h-5 -top-2 -right-2 flex items-center justify-center rounded-full text-xs text-white bg-red-600'>1</div>
                </div>
                {/* User */}
                <div className='flex items-center gap-4 bg-white px-4 py-2 rounded-full shadow-md'>
                    <div className="hidden md:flex md:flex-col">
                        <span className='text-xs leading-3 font-medium'>{profileName || user?.username}</span>
                        <span className='text-[10px] text-gray-500 text-right capitalize'>{role}</span>
                    </div>
                    <UserMenu img={profileImg} />
                </div>
            </div>
        </div>
    )
}

export default Navbar