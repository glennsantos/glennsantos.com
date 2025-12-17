// Initialize Supabase Client
const SUPABASE_URL = 'https://qbhqnmvzfvpoyshobwxs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFiaHFubXZ6ZnZwb3lzaG9id3hzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MTM4ODEsImV4cCI6MjA4MTQ4OTg4MX0.elBMco0NDp4nkkuRLGGbQ_fTXN6fJn9fhh8mJJL-wkI';

// Check if library is loaded (it is loaded via CDN in index.html)
let supabaseClient;
if (window.supabase) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Handle Google Sign-In Response (Token Exchange)
async function handleCredentialResponse(response) {
    if (!supabaseClient) {
        console.error("Supabase client not initialized.");
        return;
    }

    console.log("Google ID Token received, exchanging for Supabase session...");

    const { data, error } = await supabaseClient.auth.signInWithIdToken({
        provider: 'google',
        token: response.credential,
    });

    if (error) {
        console.error("Error signing in with Supabase:", error);
        alert("Login failed: " + error.message);
    } else {
        console.log("Supabase login successful:", data);
        // The onAuthStateChange listener in checkSession will update the UI
    }
}

// Check Session on Load
async function checkSession() {
    if (!supabaseClient) return;

    const { data: { session } } = await supabaseClient.auth.getSession();

    if (session) {
        displayUserInfo(session.user);
    }

    // Listen for auth changes
    supabaseClient.auth.onAuthStateChange((_event, session) => {
        if (session) {
            displayUserInfo(session.user);
        }
    });
}

function displayUserInfo(user) {
    console.log("User:", user);
    
    // Visual feedback
    const main = document.querySelector('main');
    const userMetadata = user.user_metadata;

    if (main && userMetadata) {
        main.innerHTML = `
            <section class="section" style="min-height: 60vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                <h2>Welcome, ${userMetadata.full_name || user.email}!</h2>
                ${userMetadata.avatar_url ? `<img src="${userMetadata.avatar_url}" alt="Profile Picture" style="border-radius: 50%; margin: 20px 0; width: 100px; height: 100px;">` : ''}
                <p>You are logged in as ${user.email}.</p>
                <button onclick="signOut()" style="margin-top: 20px; padding: 10px 20px; cursor: pointer;">Sign Out</button>
            </section>
        `;
    }
}

async function signOut() {
    const { error } = await supabaseClient.auth.signOut();
    if (!error) {
        window.location.reload();
    }
}

// Run on load
document.addEventListener('DOMContentLoaded', checkSession);
