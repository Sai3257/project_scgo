import { ArrowLeft } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  initials: string;
}

interface ProfilePageProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
}

export default function ProfilePage({ user, onBack }: ProfilePageProps) {

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0C1445] to-[#1E2A78]">
      <div className="px-3 sm:px-6 lg:px-8 py-6">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors duration-200 mb-6"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="w-full max-w-md mx-auto bg-gradient-to-br from-[#2A3B8D]/30 via-[#1E2A78]/20 to-[#3A5BC7]/20 backdrop-blur-sm rounded-2xl p-8 sm:p-10 border border-white/10 shadow-xl text-center">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover mx-auto mb-4"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-2xl sm:text-3xl mx-auto mb-4">
                {user.initials}
              </div>
            )}

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-4">{user.name}</h1>

            <div className="space-y-3 text-gray-200">
              {user.email && (
                <div className="flex items-center justify-center gap-2 text-sm sm:text-base">
                  <span aria-hidden>📧</span>
                  <span className="text-gray-200/90">{user.email}</span>
                </div>
              )}

              {user.phone && (
                <div className="flex items-center justify-center gap-2 text-sm sm:text-base">
                  <span aria-hidden>📞</span>
                  <span className="text-gray-200/90">{user.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
