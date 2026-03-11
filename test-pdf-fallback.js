async function testPdfFallback() {
    // This text doesn't have clear section headers - should trigger fallback
    const resumeText = `John Doe
Email: john@example.com
Phone: 123-456-7890

I am a passionate software developer with 5 years of experience.
I have worked on multiple projects using React, Node.js and Python.
I love building scalable web applications and solving complex problems.

WORK HISTORY
Company A - Senior Developer
- Led team of 5 developers
- Built microservices architecture
- Improved performance by 40%

Company B - Developer
- Developed customer-facing web apps
- Collaborated with UX team`;

    console.log('Testing fallback mode (no clear sections)...');
    console.log('Sending request to http://localhost:3001/api/generate-pdf...');
    try {
        const res = await fetch('http://localhost:3001/api/generate-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resumeText })
        });

        console.log('Status:', res.status);
        if (res.ok) {
            const buffer = await res.arrayBuffer();
            console.log('PDF received. Byte length:', buffer.byteLength);
            if (buffer.byteLength < 1000) {
                console.log('WARNING: PDF might be empty or have minimal content');
            } else {
                console.log('SUCCESS: PDF has substantial content');
            }
        } else {
            const text = await res.text();
            console.log('Error output:', text);
        }
    } catch (err) {
        console.error('Fetch error:', err.message);
    }
}

testPdfFallback();
