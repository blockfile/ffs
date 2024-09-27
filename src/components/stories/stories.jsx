import React, { useEffect, useState } from "react";
import { Box, Avatar, Typography } from '@mui/material';

function Stories() {
    const [avatars, setAvatars] = useState([]);

    useEffect(() => {
        const fetchAvatars = async () => {
            const avatarPromises = Array(8).fill().map(() =>
                fetch("https://api.waifu.pics/sfw/waifu")
                    .then(response => response.json())
                    .then(data => data.url)
            );

            const results = await Promise.all(avatarPromises);
            setAvatars(results);
        };

        fetchAvatars();
    }, []);

    const stories = [
        { id: 1, username: "jben...", img: avatars[0] },
        { id: 2, username: "nothing", img: avatars[1] },
        { id: 3, username: "bene-dev...", img: avatars[2] },
        { id: 4, username: "gert...", img: avatars[3] },
        { id: 5, username: "ryzz", img: avatars[4] },
        { id: 6, username: "dean...", img: avatars[5] },
        { id: 7, username: "beaufort...", img: avatars[6] },
        { id: 8, username: "clara", img: avatars[7] },
    ];

    return (
        <Box display="flex" alignItems="center" overflow="auto" paddingY={2} marginBottom={2}>
            {stories.map((story, index) => (
                <Box key={story.id} textAlign="center" marginX={1}>
                    <Avatar
                        src={avatars[index] || "https://via.placeholder.com/150"}
                        alt={story.username}
                        style={{
                            width: '64px',
                            height: '64px',
                            border: '2px solid #ff9800',
                            padding: '2px',
                            boxSizing: 'border-box',
                        }}
                    />
                    <Typography variant="caption" style={{ color: 'white', marginTop: '8px', display: 'block', width: '64px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {story.username}
                    </Typography>
                </Box>
            ))}
        </Box>
    );
}

export default Stories;
