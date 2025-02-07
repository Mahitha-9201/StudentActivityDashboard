import React from 'react';

const DiscussionStats = ({ discussionStats }) => {
    if (!discussionStats || !discussionStats.has_discussions) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Discussion Activity</h3>
                <div className="text-center text-gray-500 py-4">
                    No discussion activity found for this course.
                </div>
            </div>
        );
    }

    const { overview } = discussionStats;

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Discussion Activity</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Total Posts</div>
                    <div className="text-2xl font-bold text-gray-900">
                        {overview.total_entries}
                    </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Total Replies</div>
                    <div className="text-2xl font-bold text-gray-900">
                        {overview.total_replies}
                    </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Unique Participants</div>
                    <div className="text-2xl font-bold text-gray-900">
                        {overview.unique_posters}
                    </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Total Interactions</div>
                    <div className="text-2xl font-bold text-gray-900">
                        {overview.total_interactions}
                    </div>
                </div>
            </div>
            {discussionStats.top_discussions.length > 0 && (
                <div className="mt-6">
                    <h4 className="text-md font-semibold text-gray-700 mb-3">Most Engaged Discussions</h4>
                    <div className="space-y-3">
                        {discussionStats.top_discussions.map(discussion => (
                            <div key={discussion.id} className="bg-gray-50 p-3 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{discussion.title}</p>
                                        <p className="text-sm text-gray-500">Posted: {discussion.posted_date}</p>
                                    </div>
                                    <div className="text-blue-600 font-medium">
                                        {discussion.reply_count} replies
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DiscussionStats;