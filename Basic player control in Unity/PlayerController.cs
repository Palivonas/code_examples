using UnityEngine;
using System.Collections;

public class PlayerController : MonoBehaviour {

	public string playerName = "JC";

	private Transform arrow;
	public KeyCode stabKey = KeyCode.Space;
	public float rayLength = 100f;

	public bool alive = true;
	public int maxHealth = 2;
	public int currentHealth;

	public float stabRegenTime = 8f;
	public int maxStabs = 1;
	public int currentStabs;

	// Use this for initialization
	void Start () {
		arrow = GetComponent<MovementController> ().arrow;
		currentHealth = maxHealth;
		currentStabs = maxStabs;
	}
	
	// Update is called once per frame
	void Update () {

		if (alive) {
			if (Input.GetKeyDown (stabKey))
				stab ();
		}
	}

	IEnumerator doHitAnimation () {
		// flash the arrow sprite color
		SpriteRenderer arrowRenderer = arrow.GetComponent<SpriteRenderer> ();
		Color originalColor = arrowRenderer.color;
		arrowRenderer.color = Color.red;
		yield return new WaitForSeconds (0.5f);
		arrowRenderer.color = originalColor;
	}

	void startHitAnimation () {
		StartCoroutine (doHitAnimation ());
	}

	bool isStabReady () {
		return true;
	}

	public bool isAlive () {
		return alive;
	}

	void die () {
		alive = false;
		GetComponent<SpriteRenderer> ().color = Color.black;
	}

	void reduceHealth (int amount = 1) {
		currentHealth -= amount;
		if (currentHealth <= 0) {
			currentHealth = 0;
			die ();
		} else {
			startHitAnimation();
		}
	}

	void onStab (Transform attacker) {
		Debug.Log (transform.name + " got stabbed by " + attacker.name);
		if (currentHealth > 0)
			reduceHealth ();
	}

	void stab () {
		Debug.DrawRay(transform.position, arrow.up * rayLength, Color.red, 0.1f);
		RaycastHit2D[] hits = Physics2D.RaycastAll(transform.position, arrow.up, rayLength);
		if (hits.Length == 0)
			Debug.Log ("Missed!");
		int stabsLeft = 1;
		foreach (RaycastHit2D hit in hits) {
			if (hit.transform.tag != "Player" || hit.transform == transform)
				continue;
			if (!isStabReady()) {
				Debug.Log("Stab on cooldown");
			} else if (stabsLeft < 1) {
				// max stab targets reached
			} else {
				stabsLeft--;
				hit.transform.GetComponent<PlayerController>().onStab(transform);
			}
		}
	}
}
