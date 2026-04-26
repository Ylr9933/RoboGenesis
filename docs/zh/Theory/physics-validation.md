---
title: Physics Validation
---

# Physics Validation

## 概览

RoboGenesis 使用 NVIDIA Isaac Sim 与 PhysX 进行高保真物理仿真。本页面记录了物理验证方法论。

---

## 物理引擎

| 组件 |
| --- |
| 仿真 |
| 物理 |
| 场景格式 |
| 时间步长 |

---

## 物理参数

### 默认配置


```

physics:
dt: 0.005              # Simulation timestep

substeps: 10           # Physics substeps per frame

gravity: [0, 0, -9.81] # Gravity vector

solver_type: "TGS"     # Temporal Gauss-Seidel

contact_offset: 0.01   # Contact distance threshold

rest_offset: 0.0        # Rest distance

```


---

## 验证指标

### 位置精度


```

position_error = np.linalg.norm(simulated_position - expected_position)

```


目标：静态物体误差   1mm

### 速度精度


```

velocity_error = np.linalg.norm(simulated_velocity - expected_velocity)

```


目标：运动物体误差   5mm/s

### 接触力


```

contact_force = physics_sim.get_contact_force(body_a, body_b)

```


目标：物理上合理的力大小

---

## 夹爪验证

### 抓取稳定性


```

def test_grasp_stability(gripper, object):
# Apply grasp

gripper.close()
object.apply_random_disturbance()
# Check object remains grasped

return object in gripper.get_grasped_objects()

```


### 力闭合


```

def compute_force_closure(object, gripper_contacts):
# Compute grasp quality metric
# > 1.0 indicates stable grasp

return grasp_quality

```


---

## 物体物理属性

### 质量属性


```

object:
mass: 0.5              # kg

COM: [0, 0, 0.05]     # Center of mass

inertia: [0.001, 0.001, 0.001]  # Principal moments

```


### 摩擦模型


```

friction:
static: 0.8           # Static friction

dynamic: 0.6          # Dynamic friction

restitution: 0.2       # Bounce factor

```


---

## 液体仿真

### 倾倒验证


```

def validate_pour(source, target, expected_volume):
initial_target = target.get_liquid_level()
pour_action()
final_target = target.get_liquid_level()
transferred = final_target - initial_target
error = abs(transferred - expected_volume) / expected_volume
return error < 0.1  # 10% tolerance

```


### 搅拌验证


```

def validate_stir(beaker, rod, duration):
# Track liquid rotation

angular_velocity = compute_liquid_angular_velocity(beaker)
# Verify mixing occurred

return angular_velocity > threshold

```


---

## 验证测试

### 跌落测试


```

def drop_test(object, height):
# Drop from height

drop_object(object, height)
# Measure bounce

bounce_heights = []
for _ in range(5):
bounce_heights.append(measure_bounce(object))
# Verify energy dissipation

return all(bounce_heights[i] < bounce_heights[i-1] for i in range(1, len(bounce_heights)))

```


### 滑动测试


```

def slide_test(object, angle, expected_velocity):
incline_surface(object, angle)
release_object(object)
measured_velocity = measure_sliding_velocity(object)
return abs(measured_velocity - expected_velocity) / expected_velocity < 0.15

```


---

## 性能指标

### 仿真速度

目标：实时或更快（  1.0x）


```

sim_time = physics_sim.get_time()
wall_time = time.time() - start
speed = sim_time / wall_time

```


### 物理稳定性


```

def check_stability():
for body in get_all_bodies():
velocity = body.get_velocity()
if np.any(np.abs(velocity) > 100):  # Unrealistic velocity

return False
return True

```


---

## 关键文件

| 文件 |
| --- |
| config/simulation.yaml |
| controllers/atomic_actions/ |
| scene_manager/ |