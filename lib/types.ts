export type HumorFlavor = {
  id: string;
  name: string;
  description: string | null;
  remote_humor_flavor_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type HumorFlavorStep = {
  id: string;
  flavor_id: string;
  step_order: number;
  title: string;
  prompt_template: string;
  created_at: string;
  updated_at: string;
};

export type HumorFlavorRun = {
  id: string;
  flavor_id: string;
  image_url: string;
  final_output: string | null;
  raw_steps: unknown;
  created_by: string | null;
  created_at: string;
};
