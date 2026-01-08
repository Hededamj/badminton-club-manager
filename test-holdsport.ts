// Quick test script to see if holdsport API works locally
const testData = {
  username: 'test',
  password: 'test',
  teamId: 'test-team-id',
  teamName: 'Test Team'
}

async function test() {
  try {
    console.log('Testing POST /api/players/holdsport...')
    const res = await fetch('http://localhost:3000/api/players/holdsport', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'next-auth.session-token=dummy' // This won't work but let's see the error
      },
      body: JSON.stringify(testData)
    })

    console.log('Status:', res.status)
    const data = await res.json()
    console.log('Response:', JSON.stringify(data, null, 2))
  } catch (err) {
    console.error('Error:', err)
  }
}

test()
