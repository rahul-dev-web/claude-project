const axios = require('axios');
const { supabase, supabaseAdmin } = require('../supabaseClient');

const DISCORD_API = 'https://discord.com/api/v10';

// Exchange Discord code for access token and user info
const discordCallback = async (code) => {
  try {
    // Step 1: Exchange code for token
    const tokenResponse = await axios.post(
      `${DISCORD_API}/oauth2/token`,
      new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: process.env.DISCORD_REDIRECT_URI
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const accessToken = tokenResponse.data.access_token;
    const refreshToken = tokenResponse.data.refresh_token;

    // Step 2: Get user info from Discord
    const userResponse = await axios.get(`${DISCORD_API}/users/@me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const { id: discordId, username, avatar, email } = userResponse.data;

    // Step 3: Get user's guilds
    const guildsResponse = await axios.get(`${DISCORD_API}/users/@me/guilds`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const guilds = guildsResponse.data.filter(g => (g.permissions & 0x08) === 0x08); // ADMIN permission

    // Step 4: Upsert user in database (using admin client to bypass RLS)
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .upsert(
        {
          discord_id: discordId,
          username: username,
          avatar: avatar,
          email: email
        },
        { onConflict: 'discord_id' }
      )
      .select()
      .single();

    if (userError) {
      throw new Error(`Database error: ${userError.message}`);
    }

    // Step 5: Store guilds in database (using admin client)
    for (const guild of guilds) {
      await supabaseAdmin
        .from('servers')
        .upsert(
          {
            guild_id: guild.id,
            owner_discord_id: discordId,
            server_name: guild.name,
            server_icon: guild.icon
          },
          { onConflict: 'guild_id' }
        );
    }

    return {
      success: true,
      user: {
        id: user.id,
        discordId: user.discord_id,
        username: user.username,
        avatar: user.avatar,
        email: user.email
      },
      accessToken: accessToken,
      refreshToken: refreshToken,
      guilds: guilds.map(g => ({
        id: g.id,
        name: g.name,
        icon: g.icon
      }))
    };
  } catch (error) {
    console.error('Discord Auth Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error_description || error.message
    };
  }
};

// Get user from Discord ID
const getUserByDiscordId = async (discordId) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('discord_id', discordId)
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, user };
};

module.exports = {
  discordCallback,
  getUserByDiscordId
};