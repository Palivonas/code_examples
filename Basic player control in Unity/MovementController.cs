using UnityEngine;
using System.Collections;

public class MovementController : MonoBehaviour {

	public Transform arrow;

	public float maxSpeed = 5f;
	public float moveForce = 500f;

	private PlayerController playerController;
	private Rigidbody2D rb;

	void Start () {
		foreach (string name in Input.GetJoystickNames()) {
			Debug.Log(name);
		}
		playerController = GetComponent<PlayerController> ();
		rb = GetComponent<Rigidbody2D> ();
	}

	void FixedUpdate () {
		if (playerController.alive)
			handleMovement ();
	}

	void handleMovement () {
		float moveX = Input.GetAxis ("Horizontal");
		float moveY = Input.GetAxis ("Vertical");
		
		Vector2 moveVector = new Vector2 (moveX, moveY) * moveForce;
		rb.AddForce(moveVector);
		rb.velocity = Vector2.ClampMagnitude (rb.velocity, maxSpeed);
		
		if (rb.velocity.magnitude > 0) {
			float angle = Mathf.Atan2 (rb.velocity.x, rb.velocity.y) * Mathf.Rad2Deg;
			arrow.rotation = Quaternion.AngleAxis (angle, Vector3.back);
		}
	}
}
