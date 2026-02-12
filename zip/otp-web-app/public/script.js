function sendOTP() {
  const mobile = document.getElementById('mobile').value;

  fetch('/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile })
  })
    .then(res => res.json())
    .then(data => alert(data.message));
}

function verifyOTP() {
  const mobile = document.getElementById('mobile').value;
  const otp = document.getElementById('otp').value;

  fetch('/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile, otp })
  })
    .then(res => res.json())
    .then(data => alert(data.message));
}
