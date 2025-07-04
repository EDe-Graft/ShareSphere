import { useAuth } from '@/components/context/AuthContext';

/**
 * Example component showing different ways to use session checking
 */
export function SessionCheckExample() {
  const { user, checkSession } = useAuth();
  
  // Manual refresh
  const handleManualRefresh = () => {
    checkSession();
  };

  return (
    <div className="p-4">
      <h3>Session Check Example</h3>
      <p>Current user: {user?.displayName || 'Not logged in'}</p>
      <button 
        onClick={handleManualRefresh}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Manually Refresh Session
      </button>
    </div>
  );
} 