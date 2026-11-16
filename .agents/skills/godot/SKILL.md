---
name: godot
description: Build games and tools with the Godot Engine 4.x (https://github.com/godotengine/godot) — project layout, scenes and nodes, typed GDScript, signals, input, 2D/3D physics with CharacterBody, Tweens and AnimationPlayer, Resources, autoloads, Control UI, shaders, performance, headless testing and export. Use when creating or editing a Godot project (project.godot, .tscn, .tres, .gd, .gdshader files), porting Godot 3 code to Godot 4, or debugging a Godot error.
---

# Godot 4

Source: the Godot Engine repository, https://github.com/godotengine/godot. Its `master` branch is
4.8 beta as of November 2026. Target the latest **stable** 4.x unless the project says otherwise.
Read the version from `project.godot` (`config/features=PackedStringArray("4.x", ...)`) before
writing code, and never write Godot 3 syntax in a Godot 4 project.

## First steps in a project

1. Read `project.godot`: engine version, main scene (`run/main_scene`), autoloads, input map,
   renderer (`forward_plus`, `mobile` or `gl_compatibility`).
2. List scenes (`*.tscn`) and scripts (`*.gd`). A scene's root node type and its attached script
   are declared in the `.tscn` header lines.
3. If a `godot` binary is available, check scripts before claiming they work:
   `godot --headless --path . --check-only --script res://path/to/file.gd`
   and run the project headless with `godot --headless --path . --quit-after 120`.

## File formats

- `.tscn` / `.tres` are text. Edit them by hand only for small changes, keep `[ext_resource]` ids
  and `uid://` values consistent, and never invent a `uid://` — omit it and let the editor assign
  one. Prefer building nodes in code or asking the user to do structural edits in the editor.
- Paths use `res://` (project files) and `user://` (writable data, saves, settings).
- `.import` files and the `.godot/` folder are generated; do not commit `.godot/`.

## GDScript conventions

```gdscript
class_name Player
extends CharacterBody3D

signal health_changed(new_value: int)

const SPEED := 5.0
@export var max_health: int = 3
@export_range(0.0, 20.0, 0.5) var jump_velocity: float = 4.5

var health: int = max_health:
	set(value):
		health = clampi(value, 0, max_health)
		health_changed.emit(health)

@onready var anim: AnimationPlayer = $AnimationPlayer
@onready var mesh: Node3D = %Mesh   # unique name, set "Access as Unique Name" in the editor
```

- Indent with **tabs**. snake_case for functions and variables, PascalCase for classes and nodes,
  CONSTANT_CASE for constants.
- Type everything (`var x: int`, `-> void`, `:=` when the type is obvious). Typed code is faster
  and the editor catches errors earlier.
- Order: `class_name`, `extends`, signals, enums, constants, `@export`, public vars, private vars
  (`_name`), `@onready`, built-in callbacks (`_ready`, `_process`, `_physics_process`), public
  methods, private methods.
- Use `%UniqueName` or `@export var target: Node3D` instead of long `$A/B/C` paths, which break
  when the scene tree changes.

## Godot 3 → 4 changes agents still get wrong

| Godot 3 | Godot 4 |
|---|---|
| `export var`, `onready var`, `tool` | `@export var`, `@onready var`, `@tool` |
| `yield(obj, "signal")` | `await obj.signal` |
| `connect("pressed", self, "_on_pressed")` | `pressed.connect(_on_pressed)` |
| `emit_signal("hit", 1)` | `hit.emit(1)` |
| `KinematicBody`, `move_and_slide(velocity, Vector3.UP)` | `CharacterBody3D`; set `velocity`, call `move_and_slide()` with no arguments |
| `Spatial`, `Sprite`, `Position2D` | `Node3D`, `Sprite2D`, `Marker2D` |
| `instance()` | `instantiate()` |
| `rand_range(a, b)` | `randf_range(a, b)` / `randi_range(a, b)` |
| `Tween` node + `interpolate_property` | `create_tween().tween_property(...)` |
| `PoolStringArray` | `PackedStringArray` |
| `get_tree().change_scene("...")` | `get_tree().change_scene_to_file("...")` |
| `deg2rad`, `stepify` | `deg_to_rad`, `snapped` |
| `setget` | property `set(value):` / `get:` blocks |

## Scenes, nodes and signals

- One scene = one reusable thing (player, enemy, UI panel). Compose by instancing scenes.
- "Call down, signal up": a parent calls methods on its children; a child emits signals and never
  reaches up with `get_parent()`.
- Spawn scenes with `preload` for fixed assets and `load` for dynamic ones:
  ```gdscript
  const BULLET := preload("res://bullet/bullet.tscn")
  var b := BULLET.instantiate() as Bullet
  add_child(b)
  ```
- Free nodes with `queue_free()`, never `free()` during physics or signal callbacks.
- Groups (`add_to_group("enemies")`, `get_tree().get_nodes_in_group("enemies")`) for broadcast.
- Autoloads (Project Settings → Globals) for game-wide state such as a save system or an
  event bus. Keep them few and small.

## Input and movement

Define actions in the Input Map, never hard-code keys.

```gdscript
func _physics_process(delta: float) -> void:
	if not is_on_floor():
		velocity += get_gravity() * delta
	if Input.is_action_just_pressed("jump") and is_on_floor():
		velocity.y = jump_velocity
	var input := Input.get_vector("move_left", "move_right", "move_forward", "move_back")
	var dir := (transform.basis * Vector3(input.x, 0, input.y)).normalized()
	velocity.x = move_toward(velocity.x, dir.x * SPEED, SPEED * 10 * delta)
	velocity.z = move_toward(velocity.z, dir.z * SPEED, SPEED * 10 * delta)
	move_and_slide()
```

- Movement and physics go in `_physics_process`; visuals and UI in `_process`.
- Use `_unhandled_input(event)` for gameplay input so UI gets the event first.

## Animation

- `AnimationPlayer` for authored animation, `AnimationTree` for state machines and blending.
- Tweens for procedural motion. They are created from a node and freed automatically:
  ```gdscript
  var t := create_tween().set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
  t.tween_property(self, "scale", Vector3.ONE * 1.2, 0.12)
  t.tween_property(self, "scale", Vector3.ONE, 0.2)
  ```
  Kill a running tween before starting another on the same property (`if _tw: _tw.kill()`).
  Use `.set_parallel()` or `t.parallel()` to run steps together.

## Resources and data

- Subclass `Resource` with `class_name` and `@export` fields for item, character and level data,
  saved as `.tres`. Call `duplicate()` before changing a shared resource at runtime.
- Save game data to `user://` with `ConfigFile`, `FileAccess` + JSON, or `ResourceSaver`.
  Never write to `res://` at runtime: it is read-only in exported games.

## UI (Control)

- Lay out with containers (`VBoxContainer`, `HBoxContainer`, `MarginContainer`, `GridContainer`)
  and anchors, not absolute positions. Put shared styles in a `Theme` resource.
- Set `mouse_filter` to `MOUSE_FILTER_IGNORE` on decorative controls that should not eat clicks.
- Set Project Settings → Display → Window → Stretch mode to `canvas_items` for resolution
  independence, and test at phone aspect ratios.

## Shaders and look

- `.gdshader` with `shader_type spatial;`, `canvas_item;` or `particles;`.
- Toon look: in `light()`, quantize `dot(NORMAL, LIGHT)` into steps; draw outlines with a second
  material pass (`next_pass`) using `cull_front` and vertex extrusion along `NORMAL`.
- Use `gl_compatibility` for web and low-end mobile; `forward_plus` for desktop 3D.

## Performance

- Profile first (Debugger → Profiler, Monitors). Static typing alone speeds up GDScript.
- Cache node references in `@onready`; don't call `get_node` every frame.
- Disable processing on idle nodes (`set_process(false)`), use object pools for bullets and
  particles, `MultiMeshInstance3D` for many identical meshes, and `VisibleOnScreenNotifier` to
  pause off-screen logic.
- Move hot loops to C# or GDExtension (C++) only after profiling shows GDScript is the bottleneck.

## Export

- Install export templates matching the exact engine version.
- Headless export: `godot --headless --path . --export-release "Web" build/index.html`
  (preset names come from `export_presets.cfg`).
- Web exports need cross-origin isolation headers unless "Thread Support" is off.

## Debugging common errors

- `Invalid get index 'x' (on base: 'null instance')`: a node path is wrong or used before
  `_ready`; check `@onready` paths and scene tree order.
- `Parse Error: ... expected indented block`: mixed tabs and spaces.
- A signal handler never runs: check the connection exists (`is_connected`) and the signature
  matches the signal's arguments.
- Physics jitter: move bodies only in `_physics_process`, and enable physics interpolation
  (Project Settings → Physics → Common) for smooth rendering at high refresh rates.
