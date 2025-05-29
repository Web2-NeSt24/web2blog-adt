from .auth_test import AuthenticationTests
from .bookmark_test import BookmarkPostViewTests, BookmarkListViewTests, BookmarkInstanceViewTests
from .comment_test import CommentViewTests
from .image_test import ImageViewTests
from .like_test import LikeViewTests
from .post_test import PostViewTests
from .profile_test import ProfileViewTests, MeProfileViewTests, UsernameProfileViewTests

__all__ = [
    "AuthenticationTests",
    "BookmarkPostViewTests", "BookmarkListViewTests", "BookmarkInstanceViewTests",
    "CommentViewTests",
    "ImageViewTests",
    "LikeViewTests",
    "PostViewTests",
    "ProfileViewTests", "MeProfileViewTests", "UsernameProfileViewTests"
]