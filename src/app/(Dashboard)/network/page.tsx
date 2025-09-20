"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { UserPlus, X, Check } from "lucide-react";
import { useResourceQuery } from "@/lib/hooks/useQueryFn";
import { useResourceMutation } from "@/lib/hooks/useMutationFn";
import { Button } from "@/components/ui/button";
import Avatar from "@/components/ui/avatar";
import { Connection, UserDiscover } from "@/lib/types";

export default function NetworkPage() {
  const [activeTab, setActiveTab] = useState("discover");
  const { data: session } = useSession();

  const { data: discoverUsers, isLoading: isLoadingDiscover } =
    useResourceQuery<UserDiscover[]>({
      queryKey: ["discover"],
      endpoint: "/api/relations/discover",
      enabled: activeTab === "discover" && !!session?.accessToken,
    });

  const { data: connections, isLoading: isLoadingConnections } =
    useResourceQuery<Connection[]>({
      queryKey: ["connections"],
      endpoint: "/api/relations/followers",
      enabled: activeTab === "connections" && !!session?.accessToken,
    });

  const { data: pendingRequests, isLoading: isLoadingRequests } =
    useResourceQuery<Connection[]>({
      queryKey: ["requests"],
      endpoint: "/api/relations/connections",
      enabled: activeTab === "requests" && !!session?.accessToken,
    });

  const sendRequestMutation = useResourceMutation(
    "/api/relations/connect/request",
    "POST",
    {
      queryKey: ["discover"],
      extraKeys: [["requests"]],
    }
  );

  const respondToRequestMutation = useResourceMutation(
    "/api/relations/connect/respond",
    "POST",
    {
      queryKey: ["requests"],
      extraKeys: [["connections"], ["discover"]],
    }
  );

  const renderUserDiscoverCard = (
    user: UserDiscover,
    showActions: boolean = false
  ) => (
    <div
      key={user.id}
      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start space-x-4">
        <Avatar
          height={64}
          width={64}
          image={user.profilePhoto || null}
          name={user.name}
        />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 cursor-pointer">
            {user.name}
          </h3>
          <p className="text-gray-600 mb-1">{user.headline}</p>
          <p className="text-sm text-gray-500 mb-2">{user.location}</p>
          <p className="text-sm text-gray-700 mb-3 line-clamp-2">{user.bio}</p>

          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
            <span>{user._count?.connections || 0} connections</span>
            <span>{user._count?.followers || 0} followers</span>
          </div>
          {showActions && (
            <div className="flex space-x-2">
              {/* This logic will be a bit more complex in a real-world app */}
              <Button
                size="sm"
                onClick={() =>
                  sendRequestMutation.mutate({ targetId: user.id })
                }
                className="flex items-center space-x-2"
                disabled={sendRequestMutation.isPending}
              >
                <UserPlus className="w-4 h-4" />
                <span>Connect</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderUserFollowCard = (
    user: Connection,
    showActions: boolean = false
  ) => (
    <div
      key={user.id}
      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start space-x-4">
        <Avatar height={64} width={64} image={null} name={user.target.name} />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 cursor-pointer">
            {user.target.name}
          </h3>
          <p className="text-gray-600 mb-1">Frontend</p>
          <p className="text-sm text-gray-500 mb-2">Benin</p>
          <p className="text-sm text-gray-700 mb-3 line-clamp-2">
            Web application development
          </p>
          {showActions && (
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={() =>
                  sendRequestMutation.mutate({ targetId: user.id })
                }
                className="flex items-center space-x-2"
                disabled={sendRequestMutation.isPending}
              >
                <UserPlus className="w-4 h-4" />
                <span>Connect</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderDiscover = () => {
    if (isLoadingDiscover) return <p>Loading...</p>;
    if (!discoverUsers || discoverUsers.length === 0)
      return <p>No users found to discover.</p>;
    return (
      <div className="space-y-6">
        {discoverUsers.map((user: UserDiscover) =>
          renderUserDiscoverCard(user, true)
        )}
      </div>
    );
  };

  const renderConnections = () => {
    if (isLoadingConnections) return <p>Loading...</p>;
    if (!connections || connections.length === 0)
      return <p>You have no connections.</p>;
    return (
      <div className="space-y-6">
        {connections.map((user: Connection) => renderUserFollowCard(user))}
      </div>
    );
  };

  const renderPendingRequests = () => {
    if (isLoadingRequests) return <p>Loading...</p>;
    if (!pendingRequests || pendingRequests.length === 0)
      return <p>No pending requests.</p>;

    return (
      <div className="space-y-6">
        {pendingRequests.map((connection: Connection) => {
          const isIncoming = connection.userId !== session?.user.id;
          const user = isIncoming ? connection.user : connection.target;

          return (
            <div
              key={connection.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-4">
                <Avatar height={64} width={64} image={null} name={user.name} />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 cursor-pointer">
                    {user.name}
                  </h3>
                  <p className="text-gray-600 mb-1">software</p>
                  <p className="text-sm text-gray-500 mb-2">lagos</p>
                  <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                    {user.name}
                  </p>
                  <div className="flex space-x-2">
                    {isIncoming && (
                      <>
                        <Button
                          size="sm"
                          onClick={() =>
                            respondToRequestMutation.mutate({
                              requestId: connection.id,
                              action: "accept",
                            })
                          }
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            respondToRequestMutation.mutate({
                              requestId: connection.id,
                              action: "reject",
                            })
                          }
                        >
                          <X className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </>
                    )}
                    {!isIncoming && (
                      <Button variant="outline" size="sm" disabled>
                        Request Sent
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "discover":
        return renderDiscover();
      case "connections":
        return renderConnections();
      case "requests":
        return renderPendingRequests();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Network</h1>
          <p className="text-gray-600">
            Manage your professional connections and discover new people
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("discover")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "discover"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Discover
              </button>
              <button
                onClick={() => setActiveTab("connections")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "connections"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Connections ({connections?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab("requests")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "requests"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Pending Requests ({pendingRequests?.length || 0})
              </button>
            </nav>
          </div>
          <div className="p-6">{renderContent()}</div>
        </div>
      </main>
    </div>
  );
}
