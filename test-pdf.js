async function testPdf() {
    const resumeText = `John Doe
Developer
john@example.com

SUMMARY
A summary of the candidate.

EXPERIENCE
Company A - Developer
- Did something great.

SKILLS
React, Node.js`;

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

testPdf();
