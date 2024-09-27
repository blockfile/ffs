import React from "react";
import { Box, Typography, Avatar, Divider } from "@mui/material";
import logo from '../assets/images/trendzlogo.png'
import './rightbar.css'
function Rightbar() {
    return (
        <Box style={{ color: 'white', height: '100%', width: '100%', borderRadius: '8px' }}>
            {/* Suggestions Section */}
            <Box mb={2} p={2} style={{ borderRadius: '8px', backgroundColor: '#242526' }}>
                <Typography variant="h6" style={{ marginBottom: '10px', fontWeight: 'bold', fontFamily: 'Changa, sans-serif' }}>Suggestion For You</Typography>
                <Box display="flex" alignItems="center" mb={2}>
                    <Avatar src={logo} alt="Cristiano Ronaldo" />
                    <Typography variant="body1" style={{ marginLeft: '10px', fontFamily: 'Changa, sans-serif' }}>J-BEN (OWNER)</Typography>
                </Box>
                <Box display="flex" alignItems="center" mb={2}>
                    <Avatar src={logo} alt="Elon Musk" />
                    <Typography variant="body1" style={{ marginLeft: '10px', fontFamily: 'Changa, sans-serif' }}>Clara Jeannette</Typography>
                </Box>
            </Box>



            {/* Online Friends Section */}
            <Box mt={2} p={2} style={{ borderRadius: '8px', backgroundColor: '#242526' }}>
                <Typography variant="h6" style={{ marginBottom: '10px', fontWeight: 'bold', fontFamily: 'Changa, sans-serif' }}>Followers</Typography>
                {['Jolly', 'Nothing', 'Bene-Dev', 'Gert Baker', 'Ryzz', 'Dean', 'Beaufort'].map((friend, index) => (
                    <Box key={index} display="flex" alignItems="center" mb={2}>
                        <Avatar src={logo} alt={friend} />
                        <Typography variant="body1" style={{ marginLeft: '10px', fontFamily: 'Changa, sans-serif' }}>{friend}</Typography>
                    </Box>
                ))}
            </Box>
        </Box>
    );
}

export default Rightbar;
