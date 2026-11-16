import numpy as np,os,sys
src=sys.argv[1];out={}
for f in os.listdir(src):
    if f.endswith('.bin') and f[:2] in('af','am','bf','bm'):
        a=np.fromfile(os.path.join(src,f),dtype=np.float32);out[f[:-4]]=a.reshape(-1,1,256)
np.savez(sys.argv[2],**out);print(len(out),out['af_heart'].shape)
