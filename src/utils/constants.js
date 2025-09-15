//Object Which Contain the Constants That will be used throughout the project
export const UserRolesEnum = {
    RECRUITER: "recruiter",
    CANDIDATE: "candidate"
}

//Array which contains the constants (object only value) that will be used throughout the project
export const availableUserRole = Object.values(UserRolesEnum);

export const TaskStatusEnum = {
    POST_LISTINGS: "post_listings",
    VIEW_LISTINGS: "view_listings",
    APPLY_LISTINGS: "apply_listings",
    GIVE_ASSESSMENT: "give_assessment",
    VIEW_LEADERBOARD: "view_leaderboard",
    VIEW_SCORE: "view_score"
}

export const AvailableTaskStatus = Object.values(TaskStatusEnum);