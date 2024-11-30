// Initialize Supabase client (make sure to replace with your project URL and API key)
const supabase = createClient('YOUR_SUPABASE_PROJECT_URL', 'YOUR_SUPABASE_ANON_KEY');

// Function to add a new story to Supabase
async function addNewStory(storyData) {
    try {
        // Validate required fields
        if (!storyData.title || !storyData.author) {
            throw new Error('Story must have a title and author');
        }

        // Prepare story object
        const story = {
            title: storyData.title,
            author: storyData.author,
            readers: storyData.readers || 0,
            status: storyData.status || 'Active',
            age_rating: storyData.ageRating || '16+',
            chapters: storyData.chapters || []
        };

        // Insert story into Supabase
        const { data, error } = await supabase
            .from('stories')
            .insert(story)
            .select();

        if (error) throw error;

        console.log('Story added successfully:', data);
        return data[0];
    } catch (error) {
        console.error('Error adding story:', error);
        return null;
    }
}

// Function to fetch all stories
async function fetchStories() {
    try {
        const { data, error } = await supabase
            .from('stories')
            .select('*');

        if (error) throw error;

        return data;
    } catch (error) {
        console.error('Error fetching stories:', error);
        return [];
    }
}

// Function to update a story
async function updateStory(storyId, updateData) {
    try {
        const { data, error } = await supabase
            .from('stories')
            .update(updateData)
            .eq('id', storyId)
            .select();

        if (error) throw error;

        console.log('Story updated successfully:', data);
        return data[0];
    } catch (error) {
        console.error('Error updating story:', error);
        return null;
    }
}

// Function to add a chapter to a story
async function addChapterToStory(storyId, chapterData) {
    try {
        // Fetch current story to get existing chapters
        const { data: story, error: fetchError } = await supabase
            .from('stories')
            .select('chapters')
            .eq('id', storyId)
            .single();

        if (fetchError) throw fetchError;

        // Prepare new chapters array
        const updatedChapters = [
            ...(story.chapters || []),
            {
                id: (story.chapters?.length || 0) + 1,
                title: chapterData.title,
                content: chapterData.content,
                status: chapterData.status || 'active',
                voting_options: chapterData.votingOptions || [],
                time_remaining: chapterData.timeRemaining || '23:59:59'
            }
        ];

        // Update story with new chapters
        const { data, error } = await supabase
            .from('stories')
            .update({ chapters: updatedChapters })
            .eq('id', storyId)
            .select();

        if (error) throw error;

        console.log('Chapter added successfully:', data);
        return data[0];
    } catch (error) {
        console.error('Error adding chapter:', error);
        return null;
    }
}

// Function to vote on a chapter
async function voteOnChapter(storyId, chapterId, voteOption) {
    try {
        // Fetch current story
        const { data: story, error: fetchError } = await supabase
            .from('stories')
            .select('chapters')
            .eq('id', storyId)
            .single();

        if (fetchError) throw fetchError;

        // Find the specific chapter
        const chapters = story.chapters || [];
        const chapterIndex = chapters.findIndex(ch => ch.id === chapterId);

        if (chapterIndex === -1) {
            throw new Error('Chapter not found');
        }

        // Update voting for the chapter
        const updatedChapters = [...chapters];
        const currentChapter = updatedChapters[chapterIndex];

        // Basic voting logic (you might want to make this more sophisticated)
        if (!currentChapter.votes) {
            currentChapter.votes = {};
        }
        currentChapter.votes[voteOption] = (currentChapter.votes[voteOption] || 0) + 1;

        // Update story with new chapters
        const { data, error } = await supabase
            .from('stories')
            .update({ chapters: updatedChapters })
            .eq('id', storyId)
            .select();

        if (error) throw error;

        console.log('Vote registered successfully:', data);
        return data[0];
    } catch (error) {
        console.error('Error voting on chapter:', error);
        return null;
    }
}

// Example usage
async function initializeStoryCreation() {
    // Example story creation
    const newStory = {
        title: 'Cosmic Horizons',
        author: 'Sarah Mitchell',
        readers: 0,
        status: 'Active',
        ageRating: '12+',
        chapters: [
            {
                id: 1,
                title: 'First Contact',
                content: 'The starship emerged from hyperspace, revealing an alien landscape...',
                status: 'active',
                votingOptions: [
                    'Attempt communication',
                    'Observe from a distance',
                    'Prepare defensive maneuvers'
                ],
                timeRemaining: '23:59:59'
            }
        ]
    };

    try {
        // Add the story
        const createdStory = await addNewStory(newStory);
        
        // Add a chapter to the story
        if (createdStory) {
            await addChapterToStory(createdStory.id, {
                title: 'Unexpected Encounter',
                content: 'A mysterious signal interrupts our initial observations...'
            });
        }
    } catch (error) {
        console.error('Story creation failed:', error);
    }
}

// Supabase table structure (for reference):
/*
CREATE TABLE stories (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    readers INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Active',
    age_rating TEXT DEFAULT '16+',
    chapters JSONB[]
);
*/

// Initialize on page load or specific event
document.addEventListener('DOMContentLoaded', initializeStoryCreation);
